package repository

import (
	"context"
	"log"

	// "context"
	// "database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	// "errors"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"

	"github.com/google/uuid"
	// "github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type postgresBookingRepo struct {
	ctx context.Context
	rdb domain.RedisRepository
	db 	*gorm.DB
}

func NewPostgresBookingRepo(ctx context.Context, rdb domain.RedisRepository, db *gorm.DB) domain.PostgresRepository {
	return &postgresBookingRepo{
		ctx: ctx,
		rdb: rdb, 
		db: db,
	}
}

func (p *postgresBookingRepo) CreateBookingDB(booking *domain.Booking) error {
	err := p.db.Create(&booking).Error
	return err
}

func (p *postgresBookingRepo) UpdateBookingDB(booking *domain.Booking) error {
	err := p.db.Model(&booking).Updates(booking).Error
	return err
}

func (p *postgresBookingRepo) DeleteBookingDB(bookingID uuid.UUID) error {
	// อัปเดตเฉพาะชื่อและอายุ (Name, Age)
	booking := new(domain.Booking)
	result := p.db.
		Model(booking).
		Select("status").
		Where("id = ? AND status = confirm", bookingID).
		Updates(domain.Booking{
			Status: "cancelled",
		},
	)
	return result.Error
}

func (p *postgresBookingRepo) GetBookingDB(date *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, date.StartStr, date.EndStr)

	// var bookings []domain.Booking
	// val, err := p.rdb.Get(p.ctx, cacheKey).Result()
	// if err == nil {
	// 	// เจอข้อมูล! (Cache Hit)
	// 	// log.Println("Cache hit")
		
	// 	// แปลง JSON string กลับมาเป็น Struct (Unmarshal)
	// 	if err := json.Unmarshal([]byte(val), &bookings); err == nil {
	// 		// log.Println("Cache HIT: Return data from Redis")
	// 		return bookings, nil
	// 	}
	// 	// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
	// }
	bookings, _ := p.rdb.GetBookingRedis(cacheKey)

	// start_time >= 2026-01-01 00:00:00 AND start_time < 2026-02-01 00:00:00
	// การใช้ < (น้อยกว่า) เดือนหน้า จะครอบคลุมถึงวินาทีสุดท้ายของเดือนนี้ (31 ม.ค. 23:59:59) พอดี
	// log.Println("Cache miss")
	result := p.db.WithContext(p.ctx).
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

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		// ใช้ ctx ตัวเดิมส่งให้ Redis ด้วย
		p.rdb.SetJsonCache(cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (p *postgresBookingRepo) GetUserBookingDB(userID uuid.UUID) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:user:%s", userID)

	bookings, _ := p.rdb.GetBookingRedis(cacheKey)

	result := p.db.WithContext(p.ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name, room_number") 
    }).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, email, full_name") // ต้องมี id ของ User ด้วย
    }).
		Where("user_id = ?", userID).
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		// ใช้ ctx ตัวเดิมส่งให้ Redis ด้วย
		p.rdb.SetJsonCache(cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (p *postgresBookingRepo) GetHolidayDB(date *domain.Date) ([]domain.Holiday, error) {
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
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	// ---------------------------------------------------------
	// STEP 2: ลองดึงจาก Redis ก่อน (Cache Hit)
	// ---------------------------------------------------------
	holidays, _ := p.rdb.GetHolidayRedis(cacheKey)

	// ---------------------------------------------------------
	// STEP 3: ถ้าไม่เจอ หรือ Redis Error ให้ดึงจาก DB (Cache Miss)
	// ---------------------------------------------------------
	// log.Println("Cache MISS: Fetching from DB...")
	
	result := p.db.WithContext(p.ctx). // อย่าลืมใส่ WithContext
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
	if jsonBytes, err := json.Marshal(holidays); err == nil {
		// ตั้ง TTL (เช่น 24 ชั่วโมง เพราะวันหยุดไม่น่าเปลี่ยนบ่อย)
		p.rdb.SetJsonCache(cacheKey, jsonBytes)
	}

	return holidays, nil
}

// ใน Implementation (postgresBookingRepo)
func (p *postgresBookingRepo) DeleteHolidayCache(date *domain.Date) error {
	// 1. สร้าง Key ให้เหมือนกับตอน Get เป๊ะๆ
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	// 2. สั่งลบ (Del)
	if err := p.rdb.DeleteCache(cacheKey); err != nil {
		return err // หรือจะแค่ log ก็ได้ ถ้าซีเรียส
	}
	return nil
}

// ใน repository.go
func (p *postgresBookingRepo) ClearCacheByPrefix(prefix string) error {
	return p.rdb.ClearCacheByPrefix(prefix)
}

// repository.go

// ใช้ Redis เช็คว่าช่วงเวลานี้ Sync หรือยัง
func (p *postgresBookingRepo) IsHolidaySynced(date *domain.Date) bool {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)
	// ถ้ามี key นี้อยู่ แสดงว่า sync แล้ว (Exists return 1)
	exists := p.rdb.IsHolidaySynced(key)
	return exists > 0
}

// ใช้ Redis แปะป้ายว่า Sync แล้ว (Set Flag)
func (p *postgresBookingRepo) SetHolidaySynced(date *domain.Date) error {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)
	// ตั้ง TTL ตามความเหมาะสม เช่น 1 วัน หรือ 7 วัน (ถ้า Google Calendar ไม่ได้แก้บ่อย)
	// ข้อมูลใน DB จะถือว่า "สดใหม่" เท่ากับระยะเวลา TTL นี้
	return p.rdb.SetHolidaySynced(key)
}

func (p *postgresBookingRepo) GetRoomID(booking *domain.Booking, roomNumber uint) error {
	room := new(domain.Room)
	err := p.db.
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
func (p *postgresBookingRepo) IsRoomAvailable(booking *domain.Booking) bool {
	var countBooking int64
	var countRoom int64

	// Query เพื่อ "จับผิด" ว่ามีใครใช้รหัสนี้อยู่ไหม
	query := p.db.Model(&domain.Booking{}).
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
	queryRoom := p.db.Model(room).
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

func (p *postgresBookingRepo) IsPasscodeAvailable(booking *domain.Booking, passcode string) bool {
	var count int64

	// Query เพื่อ "จับผิด" ว่ามีใครใช้รหัสนี้อยู่ไหม
	err := p.db.Model(&domain.Booking{}).
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

func (p *postgresBookingRepo) CheckDayOff(date time.Time) error {
	if err := helper.IsWeekend(date); err != nil {
		return err
	}

	dateToCheck := date.Format("2006-01-02")

	holiday := new(domain.Holiday)
	result := p.db.Where("date = ? AND is_day_off = TRUE", dateToCheck).First(holiday)

	switch result.Error {
		case nil:
			return errors.New("Can't to book in day off")
		case gorm.ErrRecordNotFound:
			return nil
		default:
			return result.Error
	}
}

func (r *postgresBookingRepo) BulkUpsertHolidays(holidays []domain.Holiday) error {
	if len(holidays) == 0 {
		return nil
	}

	// ใช้ Batch Upsert เดิมของคุณ ดีมากแล้วครับ
	result := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "date"}}, // เช็คซ้ำที่วันที่
		DoUpdates: clause.AssignmentColumns([]string{"name", "is_day_off", "updated_at"}), // อัปเดตข้อมูลใหม่
	}).Create(&holidays)

	return result.Error
}

// func (p *postgresBookingRepo) CheckLatestUpdateHoliday(startDate string, endDate string) (*time.Time, error){
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

// func (p *postgresBookingRepo) GetEventID(bookingID uuid.UUID) (*domain.Booking, error) {
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

// func (p *postgresBookingRepo) GetCalendar(roomNumber uint) (*domain.Calendar, error) {
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

// func (p *postgresBookingRepo) GetUser(userID uuid.UUID) (*domain.User, error) {
// 	user := new(domain.User)
// 	result := p.db.First(user, userID)
// 	if result.Error != nil {
// 		return nil, result.Error
// 	}

// 	return user, nil
// }

// func (p *postgresBookingRepo) CheckSameRoom(booking *domain.Booking, roomNumber uint) error {
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