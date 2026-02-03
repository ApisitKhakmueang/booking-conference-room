package repository

import (
	"log"

	"database/sql"
	"errors"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type postgresBookingRepo struct {
	db *gorm.DB
}

func NewPostgresBookingRepo(db *gorm.DB) domain.BookingRepository {
	return &postgresBookingRepo{db: db}
}

// func (p *postgresBookingRepo) Create(book *domain.Books) error {
// 	result := p.db.Create(&book)
// 	return result.Error
// }

// func (p *postgresBookingRepo) Get(id uuid.UUID) (*domain.Books, error) {
// 	book := new(domain.Books)
// 	result := p.db.First(book, id)
//   if result.Error != nil {
// 		return nil, result.Error
// 	}

// 	return book, nil
// }

// func (p *postgresBookingRepo) Gets() ([]domain.Books, error) {
// 	var books []domain.Books
//   result := p.db.Find(&books)
//   if result.Error != nil {
//     return nil, result.Error 
//   }
//   return books, nil
// }

// func (p *postgresBookingRepo) Update(book *domain.Books) error {
// 	result := p.db.Save(book)
//   return result.Error
// }

// func (p *postgresBookingRepo) Delete(id uuid.UUID) error {
// 	var book domain.Books
//   result := p.db.Delete(&book, id)
// 	if rowsAffected := result.RowsAffected; rowsAffected == 0 {
// 		return errors.New("This book not exist")
// 	}
//   return nil
// }

func (p *postgresBookingRepo) CreateBookingDB(booking *domain.Booking) error {
	calendar := new(domain.Calendar)
	result := p.db.Select("room_id").First(calendar, booking.CalendarID)
  if result.Error != nil {
    return result.Error
  }

	booking.RoomID = calendar.RoomID

	result = p.db.Create(&booking)
	return result.Error
}

func (p *postgresBookingRepo) GetUserBookingDB(userID uuid.UUID) ([]domain.Booking, error) {
	var bookings []domain.Booking

	result := p.db.
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, email, full_name") // ต้องมี id ของ User ด้วย
    }).
		Where("user_id = ?", userID).
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresBookingRepo) GetBookingDB(dateTime *domain.Date, roomID uuid.UUID) ([]domain.Booking, error) {
	var bookings []domain.Booking

	// start_time >= 2026-01-01 00:00:00 AND start_time < 2026-02-01 00:00:00
	// การใช้ < (น้อยกว่า) เดือนหน้า จะครอบคลุมถึงวินาทีสุดท้ายของเดือนนี้ (31 ม.ค. 23:59:59) พอดี
	result := p.db.
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name") 
    }).
		Preload("User", func(db *gorm.DB) *gorm.DB {
        return db.Select("id, email, full_name")
    }).
		Where("start_time >= ? AND start_time < ? AND room_id = ? AND status = 'confirm'", dateTime.StartStr, dateTime.EndStr, roomID).
		Order("start_time desc").
		Find(&bookings)

	if result.Error != nil {
		return nil, result.Error
	}

	return bookings, nil
}

func (p *postgresBookingRepo) UpdateBookingDB(booking *domain.Booking) error {
	result := p.db.Save(booking)
	return result.Error
}

func (p *postgresBookingRepo) DeleteBookingDB(bookingID uuid.UUID) error {
	// อัปเดตเฉพาะชื่อและอายุ (Name, Age)
	booking := new(domain.Booking)
	result := p.db.Model(booking).Select("status").Where("id = ?", bookingID).Updates(domain.Booking{
		Status: "cancelled",
	})
	return result.Error
}

func (p *postgresBookingRepo) GetHolidayDB(startDate time.Time, endDate time.Time) ([]domain.Holiday, error) {
	// B. ดึงข้อมูลวันหยุดจาก DB (DB Logic)
	sDate := startDate.Format("2006-01-02")
	eDate := endDate.Format("2006-01-02")

	log.Printf("start: %v, end: %v", sDate, eDate)

	var holidays []domain.Holiday
	// SQL: SELECT * FROM holidays WHERE date ...
	result := p.db.Where("date >= ? AND date <= ?", sDate, eDate).Order("date ASC").Find(&holidays)
	if result.Error != nil {
		return nil, result.Error
	}

	return holidays, nil
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

func (p *postgresBookingRepo) GetEventID(bookingID uuid.UUID) (*domain.Booking, error) {
	booking := new(domain.Booking)
	result := p.db.Preload("Calendar", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, google_calendar_id") 
    }).
    // 2. ส่วนของตาราง Booking (ตารางหลัก)
    // ต้อง Select calendar_id (FK) ด้วย เพื่อให้รู้ว่าต้องไปดึง Calendar อันไหน
    Select("google_event_id, calendar_id"). 
    First(booking, bookingID)
	if result.Error != nil {
		return nil, result.Error
	}

	return booking, result.Error
}

func (p *postgresBookingRepo) GetCalendar(roomNumber uint) (*domain.Calendar, error) {
	calendar := new(domain.Calendar)
	result := p.db.Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, name") 
    }).
		Select("id, room_id, google_calendar_id").
		Where("calendar_number = ?", roomNumber).
		First(calendar)
  if result.Error != nil {
    return nil, result.Error
  }

	return calendar, result.Error
}

func (p *postgresBookingRepo) GetUser(userID uuid.UUID) (*domain.User, error) {
	user := new(domain.User)
	result := p.db.First(user, userID)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

func (p *postgresBookingRepo) CheckSameRoom(booking *domain.Booking, roomNumber uint) error {
	room := new(domain.Room)
	result := p.db.Select("id").Where("room_number = ?", roomNumber).First(room)
	if result.Error != nil {
		return result.Error
	}
	
	currentBooking := new(domain.Booking)
	result = p.db.Preload("Calendar").First(currentBooking, booking.ID)
	if result.Error != nil {
		return result.Error
	}
	
	// log.Printf("currentBooking: %v", currentBooking)
	currentBooking.StartTime = booking.StartTime
	currentBooking.EndTime = booking.EndTime
	currentBooking.Title = booking.Title

	*booking = *currentBooking

	// log.Println("enter check same room")

	// log.Println("room ID: ", room.ID)
	// log.Println("room ID: ", booking.RoomID)
	// log.Printf("booking db: %v", booking)

	if room.ID != booking.RoomID {
		booking.RoomID = room.ID
		return errors.New("New room")
	}

	return nil
}

func (p *postgresBookingRepo) CheckDayOff(date string) error {
	t, err := helper.IsWeekend(date)
	if err != nil {
		return err
	}

	dateToCheck := t.Format("2006-01-02")

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

func (p *postgresBookingRepo) CheckLatestUpdateHoliday(startDate time.Time, endDate time.Time) (*time.Time, error){
	// 1. ใช้ sql.NullTime เพื่อรับค่าที่อาจเป็น NULL ได้อย่างปลอดภัย 100%
	sDate := startDate.Format("2006-01-02")
	eDate := endDate.Format("2006-01-02")

	var result sql.NullTime

	err := p.db.Model(&domain.Holiday{}).
		Select("MAX(updated_at)").
		Where("date >= ? AND date <= ?", sDate, eDate).
		Scan(&result).Error // Scan เข้า sql.NullTime

	if err != nil {
		return nil, err
	}

	// 2. เช็คว่ามีค่าจริงไหม (Valid = true แปลว่าไม่ NULL)
	if result.Valid {
		// ดึงค่าเวลาออกมา แล้วคืนกลับเป็น Pointer
		return &result.Time, nil
	}

	// 3. ถ้า Valid = false แปลว่าได้ NULL (ไม่มีวันหยุดในช่วงนั้น)
	return nil, nil
}