package usercase

import (
	// "log"
	// "time"

	"errors"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"
	"github.com/google/uuid"
)

// var roomCalendarID = []string{
// 	"1d126786ac639781b3265cefc212f26fa03d88fd770aaf77ce6131190618d323@group.calendar.google.com",
// 	"84aac15c69968c01979556cb2a69806ab8b0e1abd4850e3c3fce14ada426c1ed@group.calendar.google.com",
// }

type orderUsecase struct {
	repo    domain.BookingRepository // เรียกผ่าน Interface
	gateway domain.CalendarGateway
}

// NewOrderUsecase คือ Constructor
func NewOrderUsecase(repo domain.BookingRepository, gateway domain.CalendarGateway) domain.OrderUsecase {
	return &orderUsecase{
		repo:    repo,
		gateway: gateway,
	}
}

func (u *orderUsecase) CreateBooking(booking *domain.Booking, roomNumber uint) error {
	err := helper.ValidateBusinessHours(booking.StartTime, booking.EndTime)
	if err != nil {
		return err
	}

	if err := u.repo.GetRoomID(booking, roomNumber); err != nil {
		return err
	}

	if !u.repo.IsRoomAvailable(booking) {
		return errors.New("Room unavailable")
	}

	var finalPasscode string

	// วนลูปสุ่มไปเรื่อยๆ จนกว่าจะได้เลขที่ว่าง
	for {
		// 1. สุ่มเลข 4 หลัก (เช่น "1234")
		passcode, err := helper.GeneratePasscode()
		if err != nil {
			return err
		}

		// 2. ส่งไปเช็คในฟังก์ชันข้างบน
		// "เฮ้ DB! ห้อง 1 เวลา 10:00-11:00 รหัส 1234 ว่างไหม?"
		if u.repo.IsPasscodeAvailable(booking, passcode) {
			finalPasscode = passcode // เย้! ว่าง -> เก็บค่าไว้
			break                    // หยุดวนลูป
		}

		// ถ้าไม่ว่าง (Else): มันจะวนกลับไปสุ่มเลขใหม่เอง ("5678" -> เช็คใหม่)
	}

	booking.Passcode = finalPasscode

	if err := u.repo.CreateBookingDB(booking); err != nil {
		return err
	}

	// layout := "2006-01-02 15:04:05"
	// t, err := helper.ParseTimeFormat(layout, booking.StartTime)
	// if err != nil {
	// 	return err
	// }

	// dateToCheck := t.Format("2006-01-02")
	// if err := u.repo.CheckDayOff(booking.StartTime); err != nil {
	// 	return err
	// }

	// calendar, err := u.repo.GetCalendar(roomNumber)
	// if err != nil {
	// 	return err
	// }

	// user, err := u.repo.GetUser(booking.UserID)
	// if err != nil {
	// 	return err
	// }

	// booking.CalendarID = calendar.ID
	// createEvent := &domain.CreateEvent{
	// 	GoogleCalendarID: calendar.GoogleCalendarID,
	// 	Title: booking.Title,
	// 	Email: user.Email,
	// }

	// eventID, err := u.gateway.CreateEvent(booking, createEvent)
	// if err != nil {
	// 	return err
	// }

	// booking.GoogleEventID = eventID

	// if err = u.repo.CreateBookingDB(booking); err != nil {
	// 	return err
	// }

	return nil
}

func (u *orderUsecase) UpdateBooking(booking *domain.Booking, roomNumber uint) error {
	err := helper.ValidateBusinessHours(booking.StartTime, booking.EndTime)
	if err != nil {
		return err
	}

	if err := u.repo.GetRoomID(booking, roomNumber); err != nil {
		return err
	}

	if !u.repo.IsRoomAvailable(booking) {
		return errors.New("Room unavailable")
	}

	if err := u.repo.UpdateBookingDB(booking); err != nil {
		return err
	}
	// // layout := "2006-01-02 15:04:05"
	// // t, err := helper.ParseTimeFormat(layout, booking.StartTime)
	// // if err != nil {
	// // 	return err
	// // }

	// // dateToCheck := t.Format("2006-01-02")
	// if err := u.repo.CheckDayOff(booking.StartTime); err != nil {
	// 	return err
	// }

	// // log.Println("after check day off")

	// if err := u.repo.CheckSameRoom(booking, roomNumber); err != nil {
	// 	// UpdateNewRoom
	// 	// log.Println("enter update new room")

	// 	cancelErr := u.gateway.CancelEvent(booking.Calendar.GoogleCalendarID, booking.GoogleEventID)
	// 	if cancelErr != nil {
	// 		return cancelErr
	// 	}

	// 	// log.Println("After cancel event")

	// 	calendar, err := u.repo.GetCalendar(roomNumber)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	user, err := u.repo.GetUser(booking.UserID)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	createEvent := &domain.CreateEvent{
	// 		GoogleCalendarID: calendar.GoogleCalendarID,
	// 		Title: booking.Title,
	// 		Email: user.Email,
	// 	}

	// 	eventID, err := u.gateway.CreateEvent(booking, createEvent)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	booking.CalendarID = calendar.ID
	// 	booking.GoogleEventID = eventID

	// 	booking.Calendar = nil
	// 	// log.Println("room id: ", booking.RoomID)
	// 	// log.Println("calnedarID: ", booking.CalendarID)
	// 	// log.Println("event id: ", booking.GoogleEventID)
	// } else {
	// 	// UpdateSameRoom
	// 	// log.Println("enter update same room")
	// 	// log.Printf("title: %v\n", booking.Title)
	// 	// log.Printf("booking after checksameroom: %v", booking)

	// 	updateErr := u.gateway.UpdateEventSameRoom(booking)
	// 	if updateErr != nil {
	// 		return updateErr
	// 	}
	// }

	// // log.Println("enter before update in db")
	// // log.Printf("booking: %v\n", booking)
	// if err := u.repo.UpdateBookingDB(booking); err != nil {
	// 	return err
	// }

	return nil
}

func (u *orderUsecase) DeleteBooking(bookingID uuid.UUID) error {
	// booking, err := u.repo.GetEventID(bookingID)
	// if err != nil {
	// 	return err
	// }

	// // log.Printf("booking: %v", booking)
	// // log.Printf("booking: %v", booking.GoogleEventID)
	// if err = u.gateway.CancelEvent(booking.Calendar.GoogleCalendarID, booking.GoogleEventID); err != nil {
	// 	return err
	// }

	if err := u.repo.DeleteBookingDB(bookingID); err != nil {
		return errors.New("Don't have this booking")
	}

	return nil
}

// func (u *orderUsecase) GetUserBooking(userID uuid.UUID) ([]domain.Booking, error) {
// 	bookings, err := u.repo.GetUserBookingDB(userID)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return bookings, nil
// }

// func (u *orderUsecase) GetBooking(date string, filter *domain.GetBookingFilter) ([]domain.Schedule, error) {
// 	var response []domain.Schedule

// 	DateTime, err := helper.ConvertDateToStr(filter.Duration, date)
// 	if err != nil {
// 		return nil, err
// 	}

// 	calendar, err := u.repo.GetCalendar(filter.Room)
// 	if err != nil {
// 		return nil, err
// 	}

// 	bookings, err := u.repo.GetBookingDB(DateTime, calendar.RoomID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	log.Printf("bookings: %v\n", bookings)

// 	groupBookings := helper.ConvertBooking(bookings)

// 	// log.Printf("bookings: %v\n", groupBookings)

// 	for date, events := range groupBookings {
// 		response = append(response, domain.Schedule{
// 			Date:   date,
// 			Events: events,
// 		})
// 	}

// 	// log.Printf("response: %v", response)

// 	return response, nil
// }

// func (u *orderUsecase) GetCalendar(year int, month int) (*domain.CalendarResponse, error) {
// 	loc := time.FixedZone("ICT", 7*60*60)
// 	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
// 	endDate := startDate.AddDate(0, 1, -1) // วันสุดท้ายของเดือน

// 	startWeekday := int(startDate.Weekday())

// 	// 2. หาจำนวนวันทั้งหมดในเดือน
// 	totalDays := endDate.Day()

// 	// 3. หาว่าวันที่เท่าไหร่บ้างที่เป็น เสาร์(6)-อาทิตย์(0)
// 	var weekends []int
// 	for day := range totalDays {
// 		d := time.Date(year, time.Month(month), day, 0, 0, 0, 0, loc)
// 		if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
// 			weekends = append(weekends, day)
// 		}
// 	}

// 	holidays, err := u.repo.GetHolidayDB(startDate, endDate)
// 	if err != nil {
// 		return nil, err
// 	}

// 	response := &domain.CalendarResponse{
// 		Year:         year,
// 		Month:        month,
// 		TotalDays:    totalDays,
// 		StartWeekday: startWeekday,
// 		Weekends:     weekends,
// 		Holidays:     nil,
// 	}

// 	if len(holidays) > 0 {
// 		response.Holidays = holidays
// 		return response, nil
// 	}

// 	googleHolidays, err := u.gateway.FetchHolidays(year)
// 	if err != nil {
// 		return nil, err // ถ้าต่อ Google ไม่ได้ ก็จบ
// 	}

// 	// 5. บันทึกสิ่งที่ได้ลง DB (Save for next time)
// 	// แนะนำให้ใช้ Batch Insert (Create ทีเดียวหลาย row)
// 	// if len(googleHolidays) > 0 {
// 	// 	if err := u.repo.BulkUpsertHolidays(googleHolidays); err != nil {
// 	// 		// Log error ไว้ แต่ไม่ต้อง return error ก็ได้
// 	// 		// เพราะเรามี data ส่งให้ user แล้ว (แค่ cache ไม่สำเร็จ)
// 	// 		log.Println("Failed to cache holidays:", err)
// 	// 	}
// 	// }

// 	var filteredHolidays []domain.Holiday

// 	// สมมติว่าใน function นี้คุณมีตัวแปร year และ month ที่รับมาจาก User อยู่แล้ว
// 	targetMonth := time.Month(month)

// 	for _, h := range googleHolidays {
// 		// เนื่องจาก h.Date เป็น type Custom Date เราต้องแปลงเป็น time.Time ก่อนเพื่อเช็คเดือน
// 		// (ถ้า h.Date เป็น time.Time อยู่แล้ว ก็ใช้ .Month() ได้เลย)
// 		t := time.Time(h.Date)

// 		// เช็คว่า เดือนตรงกัน และ ปีตรงกัน ไหม
// 		if t.Month() == targetMonth && t.Year() == year {
// 			filteredHolidays = append(filteredHolidays, h)
// 		}
// 	}

// 	// 3. ยัดข้อมูลที่กรองแล้ว ใส่ response
// 	response.Holidays = filteredHolidays

// 	// 6. ส่งข้อมูลที่เพิ่งดึงมากลับไป
// 	return response, nil
// }

// func (u *orderUsecase) CheckTimeUpdated(year uint, month uint) (*time.Time, error) {
// 	// คำนวณวันเริ่มต้นและสิ้นสุดของเดือน (ใช้สำหรับ Filter ใน DB)
// 	loc := time.FixedZone("ICT", 7*60*60)
// 	startDate := time.Date(int(year), time.Month(month), 1, 0, 0, 0, 0, loc)
// 	endDate := startDate.AddDate(0, 1, -1) // วันสุดท้ายของเดือน

// 	lastUpdated, err := u.repo.CheckLatestUpdateHoliday(startDate, endDate)
// 	if err != nil {
// 		return nil, err
// 	}

// 	// กรณีเดือนนั้นไม่มีวันหยุดเลย หรือยังไม่เคยแก้ ให้ใช้วันที่ปัจจุบันแทน เพื่อให้มี ETag สักค่าหนึ่ง
// 	checkTime := time.Now()
// 	if lastUpdated != nil {
// 		checkTime = *lastUpdated
// 	}

// 	return &checkTime, nil
// }
