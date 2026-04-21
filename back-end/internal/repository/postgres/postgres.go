package Postgres

import (
	"context"
	"fmt"
	"log"

	"errors"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type postgresRepository struct {
	db 	*gorm.DB
}

func NewPostgresRepository(db *gorm.DB) *postgresRepository {
	return &postgresRepository{ db: db }
}

func (p *postgresRepository) CreateBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	// 1. สร้างข้อมูล (GORM จะเอา ID มาใส่ในตัวแปร booking ให้)
	if err := p.db.WithContext(ctx).Create(booking).Error; err != nil {
		return nil, err
	}

	// 2. ดึงข้อมูลซ้ำอีกรอบเพื่อเอา Relation (Room, User) ติดมาด้วย
	if err := p.db.WithContext(ctx).Scopes(preloadBookingRelations).First(booking, booking.ID).Error; err != nil {
		return nil, err
	}

	return booking, nil
}

func (p *postgresRepository) UpdateBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	// 1. สั่ง Update
	result := p.db.WithContext(ctx).
		Clauses(clause.Returning{}).
		Where("id = ? AND user_id = ?", booking.ID, booking.UserID).
		Updates(booking)

	if result.Error != nil {
		return nil, result.Error
	}

	// 2. ดึงข้อมูลซ้ำเพื่อดึง Relation มาแปะ
	if err := p.db.WithContext(ctx).Scopes(preloadBookingRelations).First(booking, booking.ID).Error; err != nil {
		return nil, err
	}

	return booking, nil
}

func (p *postgresRepository) DeleteBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	deletedBooking := new(domain.Booking)
	now := time.Now()

	result := p.db.
		WithContext(ctx).
		Model(deletedBooking).
		Clauses(clause.Returning{}).
		// ⭐️ ไฮไลท์: ต้องยังไม่เช็คอิน (IS NULL) และ เวลาปัจจุบันต้องยังไม่ถึงเวลาเริ่ม (start_time > now)
		Where("id = ? AND status = ? AND user_id = ? AND checked_in_at IS NULL AND start_time > ?", 
			booking.ID, "confirm", booking.UserID, now).
		Updates(map[string]interface{}{
			"status":   "cancelled",
			"passcode": nil,
		})

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		// แจ้ง Error ให้ชัดเจนว่าทำไมถึงยกเลิกไม่ได้
		return nil, errors.New("cannot cancel: booking already started, checked in, or not found")
	}

	return deletedBooking, nil
}

func (p *postgresRepository) CheckOutBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	checkedOutBooking := new(domain.Booking)
    
	// เวลาปัจจุบันที่กดคืนห้อง
	now := time.Now()

	result := p.db.
		WithContext(ctx).
		Model(checkedOutBooking).
		Clauses(clause.Returning{}).
		Where("id = ? AND user_id = ? AND status = 'confirm'", booking.ID, booking.UserID).
		// ⭐️ จุดต่าง: เปลี่ยนสถานะเป็น complete และหั่นเวลาจบ
		Updates(map[string]interface{}{
				"status":   "complete",
				"end_time": now,
				"passcode": nil, // ลบ Passcode ทิ้งเพื่อความปลอดภัย
		})

	return checkedOutBooking, result.Error
}

func (p *postgresRepository) GetBookingByDayDB(ctx context.Context, date *domain.Date) ([]domain.Booking, error) {
	var bookings []domain.Booking // แนะนำให้เติม s เป็น bookings เพราะข้อมูลมาเป็น Array ครับ

	result := p.db.
		WithContext(ctx).
		Preload("User").
		Preload("Room").
		// ⭐️ แก้ลอจิก: ต้อง "มากกว่าหรือเท่ากับ" เช้าวันนี้ และ "น้อยกว่า" เช้าพรุ่งนี้
		Where("start_time >= ? AND start_time < ? AND status = ?", date.StartStr, date.EndStr, "confirm").
		Order("start_time asc"). // เรียงจากเช้าสุดไปเย็นสุด
		Find(&bookings) // ⭐️ อย่าลืมใส่ & ตรงนี้ครับ

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresRepository) GetUpNextBookingDB(ctx context.Context, endOfDay time.Time) (*domain.Booking, error) {
	// ตัวแปรรับผลลัพธ์เป็นตัวเดียว (ไม่ต้องเติม s)
	booking := new(domain.Booking)
	
	// ใช้เวลา "ณ วินาทีนี้" เป็นจุดเริ่มต้น
	now := time.Now() 

	result := p.db.
		WithContext(ctx).
		Preload("User").
		Preload("Room").
		// ⭐️ ลอจิก: "เริ่มหลังจากวินาทีนี้" และ "ก่อนหมดวัน"
		Where("start_time >= ? AND start_time < ? AND status = ?", now, endOfDay, "confirm").
		Order("start_time asc"). // เรียงจากเวลาใกล้ตัวที่สุดไปหาดึกสุด
		First(booking) // หยิบตัวแรกสุดมา

	if result.Error != nil {
		// ถ้าเป็น Error หาไม่เจอ (แปลว่าวันนี้ไม่มีคิวเหลือแล้ว) คืนค่า nil ได้เลย
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil 
		}
		return nil, result.Error
	}

	return booking, nil
}

func (p *postgresRepository) GetBookingDB(ctx context.Context,date *domain.Date, roomID uuid.UUID) ([]domain.Booking, error) {
	var bookings []domain.Booking

	// start_time >= 2026-01-01 00:00:00 AND start_time < 2026-02-01 00:00:00
	// การใช้ < (น้อยกว่า) เดือนหน้า จะครอบคลุมถึงวินาทีสุดท้ายของเดือนนี้ (31 ม.ค. 23:59:59) พอดี
	// log.Println("Cache miss")
	result := p.db.
		WithContext(ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name, room_number") 
    }).
		Preload("User", func(db *gorm.DB) *gorm.DB {
        return db.Select("id, email, full_name")
    }).
		Where("start_time >= ? AND start_time < ? AND room_id = ? AND status = 'confirm'", date.StartStr, date.EndStr, roomID).
		Order("start_time desc").
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresRepository) GetAnalyticBookingDB(ctx context.Context,date *domain.Date) ([]domain.Booking, error) {
	var bookings []domain.Booking

	// start_time >= 2026-01-01 00:00:00 AND start_time < 2026-02-01 00:00:00
	// การใช้ < (น้อยกว่า) เดือนหน้า จะครอบคลุมถึงวินาทีสุดท้ายของเดือนนี้ (31 ม.ค. 23:59:59) พอดี
	// log.Println("Cache miss")
	result := p.db.
		WithContext(ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name, room_number") 
    }).
		Where("start_time >= ? AND start_time < ?", date.StartStr, date.EndStr).
		Order("start_time desc").
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresRepository) GetBookingStatusDB(ctx context.Context) ([]domain.Booking, error) {
	var bookings []domain.Booking
	now := time.Now()

	result := p.db.
		WithContext(ctx).
		Preload("Room").
		Preload("User").
		Where("start_time <= ? AND end_time > ? AND status = ?", now, now, "confirm").
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresRepository) GetBookingStatusByRoomID_DB(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error) {
	booking := new(domain.Booking) // เป็น Pointer อยู่แล้ว
	now := time.Now()

	result := p.db.
		WithContext(ctx).
		Preload("User"). // User ใช้ Preload ปกติเพราะเราไม่ได้เอามากรองข้อมูล
		Preload("Room"). // ยังต้องใส่ไว้ เพื่อให้ GORM ยัดข้อมูล Room ลงใน Struct ให้ตอนส่งกลับ
		Where("start_time <= ? AND end_time > ? AND status = ? AND room_id = ?", now, now, "confirm", roomID).
		First(booking) // เอา & ออกได้เลยครับ เพราะ booking เป็น new() ที่เป็น Pointer อยู่แล้ว

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, result.Error
	}

	return booking, nil
}

func (p *postgresRepository) GetUserBookingDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
	layout := "2006-01"
	startTime, err := time.Parse(layout, date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %v", err)
	}

	// 2. หาจุดสิ้นสุดของวัน (คือวินาทีแรกของวันถัดไป)
	endTime := startTime.AddDate(0, 1, 0)

	var bookings []domain.Booking

	result := p.db.
		WithContext(ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name, room_number") 
    }).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, email, full_name") // ต้องมี id ของ User ด้วย
    }).
		Where("start_time >= ? AND start_time < ? AND user_id = ? AND status = 'confirm'", 
				startTime, endTime, userID).
			Order("start_time asc").
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresRepository) GetUserHistoryDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
	layout := "2006-01"
	startTime, err := time.Parse(layout, date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %v", err)
	}

	// 2. หาจุดสิ้นสุดของวัน (คือวินาทีแรกของวันถัดไป)
	endTime := startTime.AddDate(0, 1, 0)

	var bookings []domain.Booking

	result := p.db.
		WithContext(ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name, room_number") 
    }).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, email, full_name") // ต้องมี id ของ User ด้วย
    }).
		Where("start_time >= ? AND start_time < ? AND user_id = ? AND status != 'confirm'", 
				startTime, endTime, userID).
			Order("start_time asc").
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresRepository) GetHolidayDB(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	var holidays []domain.Holiday
	
	result := p.db.
		WithContext(ctx). // อย่าลืมใส่ WithContext
		Where("date >= ? AND date <= ?", date.StartStr, date.EndStr).
		Order("date ASC").
		Find(&holidays)

	if result.Error != nil {
		return nil, result.Error
	}

	return holidays, nil
}

func (p *postgresRepository) UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, newStatus string) (*domain.Booking, error) {
	updatedBooking := new(domain.Booking)

	// ⭐️ สั่ง GORM ว่า: 
	// 1. ไปที่ตาราง bookings
	// 2. เติมคำสั่ง RETURNING * ลงไปนะ (clause.Returning{})
	// 3. หา id นี้
	// 4. สั่งอัปเดตคอลัมน์ status
	result := p.db.WithContext(ctx).
		Model(updatedBooking).
		Clauses(clause.Returning{}). // ตัวนี้แหละครับที่เสก RETURNING * ให้
		Where("id = ? AND status = ?", bookingID, "confirm").
		Updates(map[string]interface{}{
			"status": newStatus,
			"passcode": nil,
		})

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
			// คืนค่า Error กลับไปบอก Usecase ว่าหาคิวจองไม่เจอ หรือสถานะไม่ใช่ confirm แล้ว
			return nil, errors.New("booking not found or status is not 'confirm'") 
			// หรือจะใช้ gorm.ErrRecordNotFound ก็ได้ครับ
	}

	// updatedBooking จะถูกเติมข้อมูลใหม่ครบทุกฟิลด์เรียบร้อย
	return updatedBooking, nil
}

func (p *postgresRepository) CreateRoomDB(ctx context.Context, room *domain.Room) error {
	if err := p.db.WithContext(ctx).Create(room).Error; err != nil {
		return err
	}

	return nil
}

func (p *postgresRepository) UpdateRoomDB(ctx context.Context, room *domain.Room) error {
	result := p.db.
		WithContext(ctx).
		Where("id = ?", room.ID).
		Select("Name", "RoomNumber", "Location", "Capacity", "Status").
		Updates(room)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (p *postgresRepository) DeleteRoomDB(ctx context.Context, roomID uuid.UUID) error {
	// ⭐️ ใช้ Transaction เพื่อให้แน่ใจว่า "ลบห้อง" และ "ยกเลิกจอง" ต้องสำเร็จทั้งคู่หรือพังทั้งคู่
	return p.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		
		// 1. ตรวจสอบก่อนว่ามีห้องนี้อยู่จริงไหม (และยังไม่ถูกลบ)
		// วิธีนี้จะช่วยให้เราส่ง error gorm.ErrRecordNotFound กลับไปได้ถูกต้อง
		var room domain.Room
		if err := tx.Where("id = ?", roomID).First(&room).Error; err != nil {
			return err // จะคืนค่า gorm.ErrRecordNotFound ถ้าหาไม่เจอ
		}

		// 2. ทำ Soft Delete ห้อง (จะไปอัปเดตคอลัมน์ deleted_at)
		if err := tx.Delete(&room).Error; err != nil {
			return err
		}

		// 3. ยกเลิกการจองในอนาคตที่ค้างอยู่ (Status 'confirm' และเวลาเริ่มจองยังไม่ถึง)
		// การใช้ tx.Model ช่วยให้ GORM รู้ว่าต้องทำงานกับตาราง bookings
		now := time.Now()
		result := tx.Model(&domain.Booking{}).
			Where("room_id = ? AND start_time > ? AND status = ?", roomID, now, "confirm").
			Updates(map[string]interface{}{
				"status":   "cancelled",
				"passcode": nil,
			})

		if result.Error != nil {
			return result.Error
		}

		// (Optional) คุณสามารถ log จำนวนการจองที่ถูกยกเลิกไปได้
		// log.Printf("Cancelled %d future bookings for room %s", result.RowsAffected, roomID)

		return nil
	})
}

func (p *postgresRepository) GetRoomDB(ctx context.Context) ([]domain.Room, error) {
	var room []domain.Room

	result := p.db.
		WithContext(ctx).
		Select("id, name, capacity, status, room_number, location").
		Where("deleted_at IS NULL").
		Find(&room)

	if result.Error != nil {
		return nil, result.Error
	}

	return room, nil
}

func (p *postgresRepository) GetRoomByID_DB(ctx context.Context, roomID uuid.UUID) (*domain.Room, error) {
	room := new(domain.Room)

	result := p.db.
		WithContext(ctx).
		Where("id = ?", roomID).
		Select("id, name, capacity, status, room_number").
		First(&room)

	if result.Error != nil {
		return nil, result.Error
	}

	return room, nil
}

func (p *postgresRepository) GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error) {
	instBooking := new(domain.Booking)
	err := p.db.WithContext(ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, room_number") 
    }).
		Select("room_id").
		First(instBooking, bookingID).Error

	if err != nil {
		return 0, err
	}

	return instBooking.Room.RoomNumber, err
}

func (p *postgresRepository) GetPaginatedUsersDB(ctx context.Context, q *domain.UserPaginationQuery) ([]domain.User, int64, error) {
	var users []domain.User
	var totalItems int64

	query := p.db.WithContext(ctx).Model(&domain.User{}).Where("role = ?", "user")
	if q.Search != "" {
		query = query.Where("full_name ILIKE ? OR email ILIKE ?", "%"+q.Search+"%", "%"+q.Search+"%")
	}

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (q.Page - 1) * q.Limit
	if err := query.Offset(offset).Limit(q.Limit).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, 0, err
	}

	// ⭐️ คืนค่ากลับไป 3 ตัวตรงๆ
	return users, totalItems, nil
}

func (p *postgresRepository) GetUserOverviewDB(ctx context.Context, userID uuid.UUID) (*domain.UserOverviewResponse, error) {
	var userInfo domain.UserInfoRes
	var stats domain.UserStatsRes

	// 1. ดึงข้อมูลพื้นฐานของ User
	if err := p.db.WithContext(ctx).Model(&domain.User{}).
		Select("id, full_name, email, avatar_url, role, status").
		Where("id = ?", userID).
		First(&userInfo).Error; err != nil {
		return nil, err
	}

	// 2. นับสถิติทุกสถานะใน Query เดียว! (Single Query Aggregation)
	if err := p.db.WithContext(ctx).Model(&domain.Booking{}).
		Select(`
			COALESCE(SUM(CASE WHEN status = 'confirm' THEN 1 ELSE 0 END), 0) as upcoming,
			COALESCE(SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END), 0) as completed,
			COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
			COALESCE(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END), 0) as no_show
		`).
		Where("user_id = ?", userID).
		Scan(&stats).Error; err != nil {
		return nil, err
	}

	return &domain.UserOverviewResponse{
		User:       userInfo,
		Statistics: stats,
	}, nil
}

func (p *postgresRepository) GetPaginatedUserBookingsDB(ctx context.Context, userID uuid.UUID, q *domain.BookingPaginationQuery) ([]domain.UserBookingHistoryRes, int64, error) {
	var bookings []domain.Booking 
	var totalItems int64

	query := p.db.WithContext(ctx).Model(&domain.Booking{}).
		Preload("Room"). // ตอนนี้ Preload จะทำงานได้ 100% แล้ว
		Where("user_id = ?", userID)

	// 2. Filter ตาม Status (ถ้ามีการส่งมาและไม่ใช่ค่าว่างหรือ ALL)
	if q.Status != "" && q.Status != "all" {
		query = query.Where("status = ?", q.Status)
	}

	// 3. Filter ตาม เดือนและปี (สร้างขอบเขตวันที่)
	if q.Year > 0 && q.Month > 0 {
		// หาวันแรกของเดือน (เช่น 2026-04-01 00:00:00)
		loc, err := time.LoadLocation("Asia/Bangkok")
		if err != nil {
			return nil, 0, err
		}
		startDate := time.Date(q.Year, time.Month(q.Month), 1, 0, 0, 0, 0, loc)
		// หาวันแรกของเดือนถัดไป (เช่น 2026-05-01 00:00:00)
		endDate := startDate.AddDate(0, 1, 0)

		// ค้นหาช่วงเวลาที่ StartTime อยู่ภายในเดือนนั้น
		query = query.Where("start_time >= ? AND start_time < ?", startDate, endDate)
	}

	// 4. นับจำนวน (Count) สำหรับทำ Pagination
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	// 5. ดึงข้อมูลจริง (Offset/Limit) โดยเรียงจากวันที่ล่าสุดก่อน
	offset := (q.Page - 1) * q.Limit
	if err := query.Offset(offset).Limit(q.Limit).Order("start_time DESC").Find(&bookings).Error; err != nil {
		return nil, 0, err
	}

	var result []domain.UserBookingHistoryRes
	for _, b := range bookings {
		// นำข้อมูลจาก Model มาใส่ใน DTO ทีละรายการ
		dto := domain.UserBookingHistoryRes{
			ID:          b.ID,
			Title:       b.Title,
			StartTime:   b.StartTime,
			EndTime:     b.EndTime,
			Status:      b.Status, // สมมติว่า Status ใน Booking เป็น string ธรรมดา 
			CheckedInAt: b.CheckedInAt,
			Room: domain.UserRoomRes{ // Mapping ข้อมูลห้อง
				ID:         b.Room.ID,
				Name:       b.Room.Name,
				RoomNumber: b.Room.RoomNumber,
				Location:   b.Room.Location,
			},
		}
		result = append(result, dto)
	}

	// ⭐️ 3. Return ตัว result ที่แปลงร่างเสร็จแล้วกลับไป
	return result, totalItems, nil
}

// helper function
func (p *postgresRepository) CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) error {
	now := time.Now()
	// ⭐️ อนุญาตให้เช็คอินก่อนเวลาเริ่มได้ 15 นาที
	allowEarlyCheckInTime := now.Add(15 * time.Minute) 

	result := p.db.WithContext(ctx).
		Model(&domain.Booking{}).
		// เช็คเงื่อนไขพื้นฐาน
		Where("room_id = ? AND passcode = ? AND status = ? AND checked_in_at IS NULL", roomID, passcode, "confirm").
		// ⭐️ start_time ต้องน้อยกว่า (เวลาปัจจุบัน + 15 นาที) และ end_time ต้องมากกว่าเวลาปัจจุบัน
		Where("start_time <= ? AND end_time > ?", allowEarlyCheckInTime, now).
		Updates(map[string]interface{}{
			"checked_in_at": now, 
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("Wrong passcode or room, or it's not time to check in yet")
	}

	return nil
}

func (p *postgresRepository) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking := new(domain.Booking)
	// ใช้ Preload ดึงข้อมูลตารางที่เกี่ยวข้องมาด้วยให้เหมือนตอน Get ปกติ
	err := p.db.
		WithContext(ctx).
		Preload("Room").
		Preload("User").
		First(booking, id).Error
	
	return booking, err
}

func (p *postgresRepository) GetRoomID(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	room := new(domain.Room)
	err := p.db.
		WithContext(ctx).
		Select("id").
		Where("room_number = ?", roomNumber).
		Find(room).Error

  if err != nil {
    return err
  }

	booking.RoomID = room.ID

	return nil
}

func (p *postgresRepository) IsRoomAvailable(ctx context.Context, booking *domain.Booking) bool {
	var countBooking int64
	var countRoom int64

	// Query เพื่อ "จับผิด" ว่ามีใครใช้รหัสนี้อยู่ไหม
	query := p.db.
		WithContext(ctx).
		Model(&domain.Booking{}).
		Where("room_id = ?", booking.RoomID).                 // 1. ตีกรอบแค่ห้องนี้ (ห้องอื่นใช้เลขเดียวกันได้ ไม่เกี่ยวกัน)
		Where("status = ?", "confirm").             // 3. เฉพาะสถานะที่ Active (ถ้า Cancelled ไปแล้วถือว่าไม่นับ)
		Where("start_time < ? AND end_time > ?", booking.EndTime, booking.StartTime) // 4. สูตรเช็คเวลาชน (Overlap)

	if booking.ID != uuid.Nil { // หรือ booking.ID != "" ถ้าเป็น string
		query = query.Where("id != ?", booking.ID)
	}

	err := query.Count(&countBooking).Error
		
	if err != nil {
		// กรณี Database Error ให้ตอบ False (ไม่ว่าง) ไปก่อนเพื่อความปลอดภัย กันระบบล่ม
		return false
	}

	room := new(domain.Room)
	queryRoom := p.db.
		WithContext(ctx).
		Model(room).
		Where("id = ?", booking.RoomID).
		Where("status = ?", "available").
		Count(&countRoom)

	log.Println("countRoom: ", countRoom)

	if queryRoom.Error != nil {
		// กรณีห้องไม่มีใน DB ให้ตอบ False (ไม่ว่าง) ไปก่อนเพื่อความปลอดภัย
		return false
	}

	// หัวใจสำคัญ:
	// ถ้า countBooking == 0 แปลว่า "ไม่เจอใครใช้เลย" -> รหัสนี้ "ว่าง" (True)
	// ถ้า countBooking > 0  แปลว่า "มีคนใช้แล้ว"     -> รหัสนี้ "ไม่ว่าง" (False)
	return countBooking == 0 && countRoom > 0
}

func (p *postgresRepository) IsPasscodeAvailable(ctx context.Context, booking *domain.Booking, passcode string) bool {
	var count int64

	// Query เพื่อ "จับผิด" ว่ามีใครใช้รหัสนี้อยู่ไหม
	err := p.db.
		WithContext(ctx).
		Model(&domain.Booking{}).
		Where("passcode = ?", passcode).
		Where("status = ?", "confirm").             // 3. เฉพาะสถานะที่ Active (ถ้า Cancelled ไปแล้วถือว่าไม่นับ)
		Count(&count).Error

	if err != nil {
			// กรณี Database Error ให้ตอบ False (ไม่ว่าง) ไปก่อนเพื่อความปลอดภัย กันระบบล่ม
		return false
	}

	// หัวใจสำคัญ:
	// ถ้า count == 0 แปลว่า "ไม่เจอใครใช้เลย" -> รหัสนี้ "ว่าง" (True)
	// ถ้า count > 0  แปลว่า "มีคนใช้แล้ว"     -> รหัสนี้ "ไม่ว่าง" (False)
	return count == 0
}

func (p *postgresRepository) CheckDayOff(ctx context.Context, date time.Time) error {
	if err := helper.IsWeekend(date); err != nil {
		return err
	}

	dateToCheck := date.Format("2006-01-02")

	holiday := new(domain.Holiday)
	result := p.db.WithContext(ctx).Where("date = ? AND is_day_off = TRUE", dateToCheck).First(holiday)

	switch result.Error {
		case nil:
			return errors.New("Can't to book in day off")
		case gorm.ErrRecordNotFound:
			return nil
		default:
			return result.Error
	}
}

func (p *postgresRepository) BulkUpsertHolidays(ctx context.Context, holidays []domain.Holiday) error {
	if len(holidays) == 0 {
		return nil
	}

	// ใช้ Batch Upsert เดิมของคุณ ดีมากแล้วครับ
	result := p.db.
		WithContext(ctx).
		Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "date"}}, // เช็คซ้ำที่วันที่
		DoUpdates: clause.AssignmentColumns([]string{"name", "is_day_off", "updated_at"}), // อัปเดตข้อมูลใหม่
	}).Create(&holidays)

	return result.Error
}

func (p *postgresRepository) GetConfigDB(ctx context.Context) (*domain.Config, error) {
	config := new(domain.Config)
	err := p.db.WithContext(ctx).First(config).Error
	if err != nil {
		return nil, err
	}
	return config, nil
}

func (p *postgresRepository) UpdateConfigDB(ctx context.Context, config *domain.Config) error {
	result := p.db.WithContext(ctx).Model(&domain.Config{}).Where("id = ?", config.ID).Updates(config)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (p *postgresRepository) UpdateUserStatusDB(ctx context.Context, userID uuid.UUID, newStatus string) error {
	result := p.db.WithContext(ctx).
		Model(&domain.User{}).
		Where("id = ?", userID).
		Update("status", newStatus) // ลบลูกน้ำออกแล้ว

	// 1. เช็ค Error จาก Database (เช่น connection หลุด หรือ query พัง)
	if result.Error != nil {
		return result.Error
	}

	// 2. ⭐️ เช็คว่าอัปเดตโดนใครไหม (ถ้าเป็น 0 แปลว่าหา User ID นี้ไม่เจอ)
	if result.RowsAffected == 0 {
		return errors.New("user not found") 
	}

	return nil
}

// internal function
// สร้างฟังก์ชัน Helper เล็กๆ ไว้ในไฟล์เดียวกัน
func preloadBookingRelations(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Room", func(db *gorm.DB) *gorm.DB { return db.Select("id, name, room_number") }).
		Preload("User", func(db *gorm.DB) *gorm.DB { return db.Select("id, email, full_name") })
}