package Postgres

import (
	"context"
	"log"

	"errors"
	"time"


	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"

	"github.com/google/uuid"
	// "github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type postgresRepository struct {
	db 	*gorm.DB
}

func NewPostgresRepository(db *gorm.DB) *postgresRepository {
	return &postgresRepository{ db: db }
}

func (p *postgresRepository) CreateBookingDB(ctx context.Context, booking *domain.Booking) error {
	err := p.db.WithContext(ctx).Create(&booking).Error
	return err
}

func (p *postgresRepository) UpdateBookingDB(ctx context.Context, booking *domain.Booking) error {
	err := p.db.WithContext(ctx).Model(&booking).Updates(booking).Error
	return err
}

func (p *postgresRepository) DeleteBookingDB(ctx context.Context, bookingID uuid.UUID) error {
	// อัปเดตเฉพาะชื่อและอายุ (Name, Age)
	booking := new(domain.Booking)
	result := p.db.
	  WithContext(ctx).
		Model(booking).
		Select("status").
		Where("id = ? AND status = ?", bookingID, "confirm").
		Updates(domain.Booking{
			Status: "cancelled",
		},
	)
	return result.Error
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

// func (p *postgresRepository) GetUserBookingDB(ctx context.Context, userID uuid.UUID) ([]domain.Booking, error) {
// 	cacheKey := fmt.Sprintf("booking:user:%s", userID)

// 	bookings, _ := p.rdb.GetBookingRedis(cacheKey)

// 	result := p.db.
// 		WithContext(ctx).
// 		Preload("Room", func(db *gorm.DB) *gorm.DB {
// 			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
// 			return db.Select("id, name, room_number") 
//     }).
// 		Preload("User", func(db *gorm.DB) *gorm.DB {
// 			return db.Select("id, email, full_name") // ต้องมี id ของ User ด้วย
//     }).
// 		Where("user_id = ?", userID).
// 		Find(&bookings)

// 	if result.Error != nil {
// 		return nil, result.Error
// 	}

// 	if jsonBytes, err := json.Marshal(bookings); err == nil {
// 		// ใช้ ctx ตัวเดิมส่งให้ Redis ด้วย
// 		p.rdb.SetJsonCache(cacheKey, jsonBytes)
// 	}

// 	return bookings, nil
// }

func (p *postgresRepository) GetHolidayDB(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	// B. ดึงข้อมูลวันหยุดจาก DB (DB Logic)
	// sDate := startDate.Format("2006-01-02")
	// eDate := endDate.Format("2006-01-02")

	// log.Printf("start: %v, end: %v", sDate, eDate)

	// var holidays []domain.Holiday
	// // SQL: SELECT * FROM holidays WHERE date ...
	// result := p.db.Where("date >= ? AND date <= ?", startDate, endDate).Order("date ASC").Find(&holidays)
	// if result.Error != nil {
	// 	return nil, result.Error
	// }

	// return holidays, nil

	// ---------------------------------------------------------
	// STEP 1: สร้าง Key สำหรับ Redis
	// ---------------------------------------------------------
	// key ควรจะไม่ซ้ำกันตามช่วงเวลา เช่น "holidays:2023-01-01:2023-01-31"

	// ---------------------------------------------------------
	// STEP 2: ลองดึงจาก Redis ก่อน (Cache Hit)
	// ---------------------------------------------------------
	var holidays []domain.Holiday

	// ---------------------------------------------------------
	// STEP 3: ถ้าไม่เจอ หรือ Redis Error ให้ดึงจาก DB (Cache Miss)
	// ---------------------------------------------------------
	// log.Println("Cache MISS: Fetching from DB...")
	
	result := p.db.
		WithContext(ctx). // อย่าลืมใส่ WithContext
		Where("date >= ? AND date <= ?", date.StartStr, date.EndStr).
		Order("date ASC").
		Find(&holidays)

	if result.Error != nil {
		return nil, result.Error
	}

	// ---------------------------------------------------------
	// STEP 4: บันทึกลง Redis (Set Cache) เพื่อใช้รอบหน้า
	// ---------------------------------------------------------
	// แปลง Struct เป็น JSON (Marshal)

	return holidays, nil
}

func (r *postgresRepository) UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, newStatus string) (*domain.Booking, error) {
	updatedBooking := new(domain.Booking)

	// ⭐️ สั่ง GORM ว่า: 
	// 1. ไปที่ตาราง bookings
	// 2. เติมคำสั่ง RETURNING * ลงไปนะ (clause.Returning{})
	// 3. หา id นี้
	// 4. สั่งอัปเดตคอลัมน์ status
	err := r.db.WithContext(ctx).
		Model(updatedBooking).
		Clauses(clause.Returning{}). // ตัวนี้แหละครับที่เสก RETURNING * ให้
		Where("id = ? AND status = ?", bookingID, "confirm").
		Update("status", newStatus).Error

	if err != nil {
		return nil, err
	}

	// updatedBooking จะถูกเติมข้อมูลใหม่ครบทุกฟิลด์เรียบร้อย
	return updatedBooking, nil
}

func (p *postgresRepository) GetRoomNumber(ctx context.Context, bookingID uuid.UUID) (uint, error) {
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

// helper function
func (r *postgresRepository) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking := new(domain.Booking)
	// ใช้ Preload ดึงข้อมูลตารางที่เกี่ยวข้องมาด้วยให้เหมือนตอน Get ปกติ
	err := r.db.WithContext(ctx).
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

// รับค่า DB, RoomID (สำคัญ), รหัสที่สุ่มได้, และช่วงเวลาที่จะจอง
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
		Where("is_active = ?", "available").
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

func (r *postgresRepository) BulkUpsertHolidays(ctx context.Context, holidays []domain.Holiday) error {
	if len(holidays) == 0 {
		return nil
	}

	// ใช้ Batch Upsert เดิมของคุณ ดีมากแล้วครับ
	result := r.db.
		WithContext(ctx).
		Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "date"}}, // เช็คซ้ำที่วันที่
		DoUpdates: clause.AssignmentColumns([]string{"name", "is_day_off", "updated_at"}), // อัปเดตข้อมูลใหม่
	}).Create(&holidays)

	return result.Error
}

// func (p *postgresRepository) CheckLatestUpdateHoliday(startDate string, endDate string) (*time.Time, error){
// 	// 1. ใช้ sql.NullTime เพื่อรับค่าที่อาจเป็น NULL ได้อย่างปลอดภัย 100%
// 	// sDate := startDate.Format("2006-01-02")
// 	// eDate := endDate.Format("2006-01-02")

// 	var result sql.NullTime

// 	err := p.db.Model(&domain.Holiday{}).
// 		Select("MAX(updated_at)").
// 		Where("date >= ? AND date <= ?", startDate, endDate).
// 		Scan(&result).Error // Scan เข้า sql.NullTime

// 	if err != nil {
// 		return nil, err
// 	}

// 	// 2. เช็คว่ามีค่าจริงไหม (Valid = true แปลว่าไม่ NULL)
// 	if result.Valid {
// 		// ดึงค่าเวลาออกมา แล้วคืนกลับเป็น Pointer
// 		return &result.Time, nil
// 	}

// 	// 3. ถ้า Valid = false แปลว่าได้ NULL (ไม่มีวันหยุดในช่วงนั้น)
// 	return nil, nil
// }

// func (p *postgresRepository) GetEventID(bookingID uuid.UUID) (*domain.Booking, error) {
// 	booking := new(domain.Booking)
// 	result := p.db.Preload("Calendar", func(db *gorm.DB) *gorm.DB {
// 			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
// 			return db.Select("id, google_calendar_id") 
//     }).
//     // 2. ส่วนของตาราง Booking (ตารางหลัก)
//     // ต้อง Select calendar_id (FK) ด้วย เพื่อให้รู้ว่าต้องไปดึง Calendar อันไหน
//     Select("google_event_id, calendar_id"). 
//     First(booking, bookingID)
// 	if result.Error != nil {
// 		return nil, result.Error
// 	}

// 	return booking, result.Error
// }

// func (p *postgresRepository) GetCalendar(roomNumber uint) (*domain.Calendar, error) {
// 	calendar := new(domain.Calendar)
// 	result := p.db.Preload("Room", func(db *gorm.DB) *gorm.DB {
// 			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
// 			return db.Select("id, name") 
//     }).
// 		Select("id, room_id, google_calendar_id").
// 		Where("calendar_number = ?", roomNumber).
// 		First(calendar)
//   if result.Error != nil {
//     return nil, result.Error
//   }

// 	return calendar, result.Error
// }

// func (p *postgresRepository) GetUser(userID uuid.UUID) (*domain.User, error) {
// 	user := new(domain.User)
// 	result := p.db.First(user, userID)
// 	if result.Error != nil {
// 		return nil, result.Error
// 	}

// 	return user, nil
// }

// func (p *postgresRepository) CheckSameRoom(booking *domain.Booking, roomNumber uint) error {
// 	room := new(domain.Room)
// 	result := p.db.Select("id").Where("room_number = ?", roomNumber).First(room)
// 	if result.Error != nil {
// 		return result.Error
// 	}
	
// 	currentBooking := new(domain.Booking)
// 	result = p.db.Preload("Calendar").First(currentBooking, booking.ID)
// 	if result.Error != nil {
// 		return result.Error
// 	}
	
// 	// log.Printf("currentBooking: %v", currentBooking)
// 	currentBooking.StartTime = booking.StartTime
// 	currentBooking.EndTime = booking.EndTime
// 	currentBooking.Title = booking.Title

// 	*booking = *currentBooking

// 	// log.Println("enter check same room")

// 	// log.Println("room ID: ", room.ID)
// 	// log.Println("room ID: ", booking.RoomID)
// 	// log.Printf("booking db: %v", booking)

// 	if room.ID != booking.RoomID {
// 		booking.RoomID = room.ID
// 		return errors.New("New room")
// 	}

// 	return nil
// }