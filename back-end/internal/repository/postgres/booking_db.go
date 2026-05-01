package postgresRepo

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type bookingPostgresRepo struct {
	db *gorm.DB
}

func NewBookingPostgresRepo(db *gorm.DB) domain.BookingPostgresRepo {
	return &bookingPostgresRepo{db: db}
}

func (p *bookingPostgresRepo) CreateBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	// 1. สร้างข้อมูล (GORM จะเอา ID มาใส่ในตัวแปร booking ให้)
	if err := p.db.WithContext(ctx).Create(booking).Error; err != nil {
		return nil, err
	}

	// 2. ดึงข้อมูลซ้ำอีกรอบเพื่อเอา Relation (Room, User) ติดมาด้วย
	if err := p.db.WithContext(ctx).Scopes(preloadBookingRelations).First(booking).Error; err != nil {
		return nil, err
	}

	return booking, nil
}

func (p *bookingPostgresRepo) UpdateBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	// 1. สั่ง Update
	result := p.db.WithContext(ctx).
		Clauses(clause.Returning{}).
		Where("user_id = ?", booking.UserID).
		Select("StartTime", "EndTime", "Title", "UpdatedAt").
		Updates(booking)

	if result.Error != nil {
		return nil, result.Error
	}

	// 2. ดึงข้อมูลซ้ำเพื่อดึง Relation มาแปะ
	if err := p.db.WithContext(ctx).Scopes(preloadBookingRelations).First(booking).Error; err != nil {
		return nil, err
	}

	return booking, nil
}

func (p *bookingPostgresRepo) DeleteBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
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

func (p *bookingPostgresRepo) CheckOutBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
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

func (p *bookingPostgresRepo) CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) error {
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

func (p *bookingPostgresRepo) GetBookingByDayDB(ctx context.Context, date *domain.Date) ([]domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetUpNextBookingDB(ctx context.Context, endOfDay time.Time) (*domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetBookingDB(ctx context.Context,date *domain.Date, roomID uuid.UUID) ([]domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetAnalyticBookingDB(ctx context.Context,date *domain.Date) ([]domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetBookingStatusDB(ctx context.Context) ([]domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetBookingStatusByRoomID_DB(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetUserBookingDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetUserHistoryDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
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

func (p *bookingPostgresRepo) UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, newStatus string) (*domain.Booking, error) {
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

func (p *bookingPostgresRepo) GetConfigDB(ctx context.Context) (*domain.Config, error) {
	config := new(domain.Config)
	err := p.db.WithContext(ctx).First(config).Error
	if err != nil {
		return nil, err
	}
	return config, nil
}

func (p *bookingPostgresRepo) IsRoomAvailable(ctx context.Context, booking *domain.Booking) bool {
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

func (p *bookingPostgresRepo) IsPasscodeAvailable(ctx context.Context, booking *domain.Booking, passcode string) bool {
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

func (p *bookingPostgresRepo) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking := new(domain.Booking)
	// ใช้ Preload ดึงข้อมูลตารางที่เกี่ยวข้องมาด้วยให้เหมือนตอน Get ปกติ
	err := p.db.
		WithContext(ctx).
		Preload("Room").
		Preload("User").
		First(booking, id).Error
	
	return booking, err
}

func (p *bookingPostgresRepo) GetRoomID(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
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

func (p *bookingPostgresRepo) CheckDayOff(ctx context.Context, date time.Time) error {
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

func (p *bookingPostgresRepo) GetRoomDB(ctx context.Context) ([]domain.Room, error) {
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

func (p *bookingPostgresRepo) GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error) {
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

func preloadBookingRelations(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Room", func(db *gorm.DB) *gorm.DB { return db.Select("id, name, room_number") }).
		Preload("User", func(db *gorm.DB) *gorm.DB { return db.Select("id, email, full_name") })
}