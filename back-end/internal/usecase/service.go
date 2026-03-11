package usercase

import (
	// "fmt"
	"context"
	"log"
	"time"

	"errors"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain/repository/calendar"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain/repository/postgres"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain/repository/redis"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/worker"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	// "github.com/google/uuid"
)

type bookingUsecase struct {
	redis 						redisRepo.RedisRepository       // เรียกผ่าน Interface
	helperRedis 			redisRepo.HelperRedisRepository
	helperPostgres    postgresRepo.HelperPostgresRepository // เรียกผ่าน Interface
	publisher         redisRepo.RealtimePublisher
	gateway 					calendarGateway.CalendarGateway
	asynqClient				*asynq.Client
}

// NewBookingUsecase คือ Constructor
func NewBookingUsecase(
	redis 					redisRepo.RedisRepository, 
	helperRedis 		redisRepo.HelperRedisRepository, 
	helperPostgres 	postgresRepo.HelperPostgresRepository, 
	publisher       redisRepo.RealtimePublisher,
	gateway 				calendarGateway.CalendarGateway,
	asynqClient     			*asynq.Client) domain.BookingUsecase {
	return &bookingUsecase{
		redis:      			redis,
		helperRedis: 			helperRedis,
		helperPostgres:   helperPostgres,
		publisher:       	publisher,
		gateway: 					gateway,
		asynqClient:			asynqClient,
	}
}

func (u *bookingUsecase) CreateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) error {
	// if err := u.helperPostgres.CheckDayOff(ctx, *booking.StartTime); err != nil {
	// 	return err
	// }

	// err := helper.ValidateBusinessHours(*booking.StartTime, *booking.EndTime)
	// if err != nil {
	// 	return err
	// }

	// if err := helper.CheckBeforeOneHour(*booking.StartTime); err != nil {
	// 	return err
	// }

	if err := helper.CheckMaxAdvanceBooking(*booking.StartTime); err != nil {
		return err
	}

	if err := u.helperPostgres.GetRoomID(ctx, booking, roomNumber); err != nil {
		return err
	}

	if !u.helperPostgres.IsRoomAvailable(ctx, booking) {
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
		if u.helperPostgres.IsPasscodeAvailable(ctx,booking, passcode) {
			finalPasscode = passcode // เย้! ว่าง -> เก็บค่าไว้
			break                    // หยุดวนลูป
		}

		// ถ้าไม่ว่าง (Else): มันจะวนกลับไปสุ่มเลขใหม่เอง ("5678" -> เช็คใหม่)
	}

	booking.Passcode = finalPasscode
	booking.ID = uuid.New()

	if err := u.redis.CreateBooking(ctx, booking, roomNumber); err != nil {
		return err
	}

	// completedBooking, err := u.helperPostgres.GetBookingByID(ctx, booking.ID)
	// if err != nil {
	// 	return err
	// }

	// if completedBooking.StartTime != nil {
	// 	// 1. ดึง ปี, เดือน, วัน ออกมาจากทั้งคู่
	// 	nowYear, nowMonth, nowDay := time.Now().Date()
	// 	bookYear, bookMonth, bookDay := completedBooking.StartTime.Date()

	// 	// 2. เทียบทีละตัวว่าตรงกันหมดหรือไม่
	// 	if nowYear == bookYear && nowMonth == bookMonth && nowDay == bookDay {
	// 		u.PublishStatus("booking_created", completedBooking)
	// 	}
	// }
	u.PublishEvent("booking_created", roomNumber, booking)

	go func(b *domain.Booking) {
		u.EnqeueEvent(b)
	}(booking)

	// layout := "2006-01-02 15:04:05"
	// t, err := helper.ParseTimeFormat(layout, booking.StartTime)
	// if err != nil {
	// 	return err
	// }

	// dateToCheck := t.Format("2006-01-02")

	// calendar, err := u.helperPostgres.GetCalendar(roomNumber)
	// if err != nil {
	// 	return err
	// }

	// user, err := u.helperPostgres.GetUser(booking.UserID)
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

	// if err = u.helperPostgres.CreateBookingDB(booking); err != nil {
	// 	return err
	// }

	return nil
}

func (u *bookingUsecase) UpdateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) error {
	// if err := u.helperPostgres.CheckDayOff(ctx, *booking.StartTime); err != nil {
	// 	return err
	// }

	// err := helper.ValidateBusinessHours(*booking.StartTime, *booking.EndTime)
	// if err != nil {
	// 	return err
	// }

	// if err := helper.CheckBeforeOneHour(*booking.StartTime); err != nil {
	// 	return err
	// }

	if err := helper.CheckMaxAdvanceBooking(*booking.StartTime); err != nil {
		return err
	}

	if err := u.helperPostgres.GetRoomID(ctx, booking, roomNumber); err != nil {
		return err
	}

	if !u.helperPostgres.IsRoomAvailable(ctx, booking) {
		return errors.New("Room unavailable")
	}

	if err := u.redis.UpdateBooking(ctx, booking, roomNumber); err != nil {
		return err
	}

	
	// if completedBooking.StartTime != nil {
	// 	// 1. ดึง ปี, เดือน, วัน ออกมาจากทั้งคู่
	// 	nowYear, nowMonth, nowDay := time.Now().Date()
	// 	bookYear, bookMonth, bookDay := completedBooking.StartTime.Date()
	
	// 	// 2. เทียบทีละตัวว่าตรงกันหมดหรือไม่
	// 	if nowYear == bookYear && nowMonth == bookMonth && nowDay == bookDay {
	// 		u.PublishStatus("booking_updated", completedBooking)
	// 	}
	// }
		
	u.PublishEvent("booking_updated", roomNumber, booking)

	go func(b *domain.Booking) {
		u.EnqeueEvent(b)
	}(booking)

	// // }

	// // dateToCheck := t.Format("2006-01-02")

	// // log.Println("after check day off")

	// if err := u.helperPostgres.CheckSameRoom(booking, roomNumber); err != nil {
	// 	// UpdateNewRoom
	// 	// log.Println("enter update new room")

	// 	cancelErr := u.gateway.CancelEvent(booking.Calendar.GoogleCalendarID, booking.GoogleEventID)
	// 	if cancelErr != nil {
	// 		return cancelErr
	// 	}

	// 	// log.Println("After cancel event")

	// 	calendar, err := u.helperPostgres.GetCalendar(roomNumber)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	user, err := u.helperPostgres.GetUser(booking.UserID)
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
	// if err := u.helperPostgres.UpdateBookingDB(booking); err != nil {
	// 	return err
	// }

	return nil
}

func (u *bookingUsecase) DeleteBooking(ctx context.Context,bookingID uuid.UUID) error {
	// booking, err := u.helperPostgres.GetEventID(bookingID)
	// if err != nil {
	// 	return err
	// }

	// // log.Printf("booking: %v", booking)
	// // log.Printf("booking: %v", booking.GoogleEventID)
	// if err = u.gateway.CancelEvent(booking.Calendar.GoogleCalendarID, booking.GoogleEventID); err != nil {
	// 	return err
	// }

	completedBooking, err := u.helperPostgres.GetBookingByID(ctx, bookingID)
	if err != nil {
		return err
	}

	if err := helper.CheckBeforeOneHour(*completedBooking.StartTime); err != nil {
		return err
	}

	roomNumber, err := u.helperPostgres.GetRoomNumber(ctx, completedBooking.ID)
	if err != nil {
		return err
	}

	deletedBooking, err := u.redis.DeleteBooking(ctx, completedBooking, roomNumber);
	if err != nil {
		return errors.New("Don't have this booking")
	}

	u.PublishEvent("booking_deleted", roomNumber, deletedBooking)
	// u.PublishStatus("booking_deleted", completedBooking)

	return nil
}

func (u *bookingUsecase) GetBooking(ctx context.Context,date *domain.Date, roomNumber uint) ([]domain.Booking, error) {
	var response []domain.Booking
	instBooking := new(domain.Booking)
	if err := u.helperPostgres.GetRoomID(ctx, instBooking, roomNumber); err != nil {
		return nil, err
	}

	bookings, err := u.redis.GetBooking(ctx, date, instBooking.RoomID, roomNumber)
	if err != nil {
		return nil, err
	}
	// log.Printf("bookings: %v\n", bookings)

	groupBookings, err := helper.ConvertBooking(bookings)
	if err != nil {
		return nil, err
	}

	// log.Printf("bookings: %v\n", groupBookings)

	for _, events := range groupBookings {
		response = append(response, events...)
	}

	// log.Printf("response: %v", response)

	return response, nil
}

func (u *bookingUsecase) GetBookingStatus(ctx context.Context) ([]domain.Booking, error) {
	timeStart := time.Now().Format("2006-01-02")

	booking, err := u.redis.GetBookingStatus(ctx, timeStart)
	if err != nil {
		return nil, err
	}

	// log.Printf("booking: %v", booking)
	return booking, nil
}

// func (u *bookingUsecase) GetUserBooking(ctx context.Context,userID uuid.UUID) ([]domain.Booking, error) {
// 	bookings, err := u.helperPostgres.GetUserBookingDB(userID)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return bookings, nil
// }

func (u *bookingUsecase) GetRoomDetails(ctx context.Context) ([]domain.Room, error) {
	rooms, err := u.redis.GetRoomDetails(ctx)
	if err != nil {
		return nil, err
	}

	return rooms, nil
}

func (u *bookingUsecase) GetHoliday(ctx context.Context,date *domain.Date) ([]domain.Holiday, error) {
// 	// loc := time.FixedZone("ICT", 7*60*60)
// 	// startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
// 	// endDate := startDate.AddDate(0, 1, -1) // วันสุดท้ายของเดือน

// 	// 3. หาว่าวันที่เท่าไหร่บ้างที่เป็น เสาร์(6)-อาทิตย์(0)

	now := time.Now()

	// 2. ใช้ Format มาตรฐาน (2006-01-02 คือสูตรลับของ Go ห้ามเปลี่ยนเลข)
	layout := "2006-01-02"

	// StartDate: วันนี้
	if date.StartStr == "" {
		date.StartStr = now.Format(layout)
	}

	// 3. EndDate: ใช้ AddDate(ปี, เดือน, วัน)
	// Go จะจัดการเรื่อง เดือน 12 -> 1 หรือ ปีอธิกสุรทิน ให้เองอัตโนมัติ
	if date.EndStr == "" {
		nextMonth := now.AddDate(0, 1, 0) 
		date.EndStr = nextMonth.Format(layout)
	}

	isSynced := u.helperRedis.FindHolidaySynced(ctx, date)

	if isSynced > 0{
		// ถ้า Sync แล้ว -> ดึงจาก DB ได้เลย มั่นใจได้ว่าข้อมูลครบ
		holidays, err := u.redis.GetHoliday(ctx, date)
		if err != nil {
			return nil, err
		}
		// ถ้า DB ว่างเปล่า (len=0) ก็แปลว่าเดือนนั้นไม่มีวันหยุดจริงๆ (เพราะ Sync มาแล้ว)
		// ดังนั้น return ได้เลย
		return holidays, nil
	}

	googleHolidays, err := u.gateway.FetchHolidays(date)
	if err != nil {
		// กรณีต่อ Google ไม่ได้ ให้ลองไปดึงของเก่าจาก DB มาใช้แก้ขัดไปก่อน (Fallback)
		fallbackHolidays, dbErr := u.redis.GetHoliday(ctx, date)
		if dbErr == nil && len(fallbackHolidays) > 0 {
			return fallbackHolidays, nil // ดีกว่า return error
		}
		return nil, err
	}

// 	// log.Printf("BEFORE INSERT: First=%v, Last=%v\n", googleHolidays[0].Date.Time(), googleHolidays[len(googleHolidays)-1].Date.Time())

// 	// 5. บันทึกสิ่งที่ได้ลง DB (Save for next time)
// 	// แนะนำให้ใช้ Batch Insert (Create ทีเดียวหลาย row)
	if len(googleHolidays) > 0 {
		if err := u.helperPostgres.BulkUpsertHolidays(ctx, googleHolidays); err != nil {
			// Log error ไว้ แต่ไม่ต้อง return error ก็ได้
			// เพราะเรามี data ส่งให้ user แล้ว (แค่ cache ไม่สำเร็จ)
			log.Println("Failed to cache holidays:", err)
		}

		if err := u.helperRedis.DeleteHolidayCache(ctx, date); err != nil {
			return nil, err
		}
	}

	if err := u.helperRedis.SetHolidaySynced(ctx, date); err != nil {
		log.Println("Failed to set sync flag:", err)
	}

	return googleHolidays, nil
// 	var filteredHolidays []domain.Holiday

// 	// สมมติว่าใน function นี้คุณมีตัวแปร year และ month ที่รับมาจาก User อยู่แล้ว
// 	targetMonth := time.Month(month)

// 	for _, h := range googleHolidays {
// 		// เนื่องจาก h.Date เป็น type Custom Date เราต้องแปลงเป็น time.Time ก่อนเพื่อเช็คเดือน
// 		// (ถ้า h.Date เป็น time.Time อยู่แล้ว ก็ใช้ .Month() ได้เลย)
// 		t := h.Date.Time()

// 		// เช็คว่า เดือนตรงกัน และ ปีตรงกัน ไหม
// 		if t.Month() == targetMonth && t.Year() == year {
// 			filteredHolidays = append(filteredHolidays, h)
// 		}
// 	}

// 	// 3. ยัดข้อมูลที่กรองแล้ว ใส่ response
// 	response.Holidays = filteredHolidays

// 	// 6. ส่งข้อมูลที่เพิ่งดึงมากลับไป
}

// func (u *bookingUsecase) CheckTimeUpdated(startDate string, endDate string) (*time.Time, error) {
// 	// คำนวณวันเริ่มต้นและสิ้นสุดของเดือน (ใช้สำหรับ Filter ใน DB)
// 	// loc := time.FixedZone("ICT", 7*60*60)
// 	// startDate := time.Date(int(year), time.Month(month), 1, 0, 0, 0, 0, loc)
// 	// endDate := startDate.AddDate(0, 1, -1) // วันสุดท้ายของเดือน

// 	lastUpdated, err := u.helperPostgres.CheckLatestUpdateHoliday(startDate, endDate)
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

// Helper function
func (u *bookingUsecase) UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID) error {
	booking, roomNumber, err := u.redis.UpdateBookingStatus(ctx, bookingID);
	if err != nil {
		return err
	}

	u.PublishEvent("booking_end", roomNumber, booking)
	u.PublishStatus("booking_end", booking)
	// u.PublishStatus("booking_updated_status", booking)

	return nil
}

func (u *bookingUsecase) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking, err := u.helperPostgres.GetBookingByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (u *bookingUsecase) PublishStatus(event string, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"status":		true,
		"booking":	completedBooking, // ข้อมูล Booking ที่เพิ่งสร้างเสร็จ (มี ID แล้ว)
	}

	// log.Printf("Publishing real-time event: %v", payload)

	go func() {
		// ต้องใช้ context.Background() เพราะ ctx เดิมอาจจะหมดอายุตอน API จบ
		bgCtx := context.Background()
		if pubErr := u.publisher.PublishEvent(bgCtx, event, payload); pubErr != nil {
			log.Printf("Failed to publish real-time event: %v", pubErr)
		}
	}()
}

// Internal function 
func (u *bookingUsecase) PublishEvent(event string, roomNumber uint, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"room_number": roomNumber,
		"booking":     completedBooking, // ข้อมูล Booking ที่เพิ่งสร้างเสร็จ (มี ID แล้ว)
	}

	// log.Printf("Publishing real-time event: %v", payload)

	go func() {
		// ต้องใช้ context.Background() เพราะ ctx เดิมอาจจะหมดอายุตอน API จบ
		bgCtx := context.Background()
		if pubErr := u.publisher.PublishEvent(bgCtx, event, payload); pubErr != nil {
			log.Printf("Failed to publish real-time event: %v", pubErr)
		}
	}()
}

func (u *bookingUsecase) EnqeueEvent(booking *domain.Booking) {
	endTask, endTaskErr := worker.NewBookingExpiredTask(booking.ID)
	startTask, startTaskErr := worker.NewBookingStartTask(booking.ID)
	// Create booking start endTask
	if endTaskErr == nil || startTaskErr == nil {
		// Asynq Client จะโยนงานนี้ไปฝากไว้ใน Redis ก่อน
		// ใช้ `asynq.ProcessAt` เพื่อระบุเวลาเป๊ะๆ ที่จะให้งานนี้ทำงาน!
		endInfo, endErr := u.asynqClient.Enqueue(endTask, asynq.ProcessAt(*booking.EndTime))
		
		if endErr != nil {
			log.Printf("❌ Failed to enqueue end task: %v", endErr)
		} else {
			log.Printf("✅ Task enqueued! Will execute at: %v (ID: %s)", booking.EndTime, endInfo.ID)
		}

		startInfo, startErr := u.asynqClient.Enqueue(startTask, asynq.ProcessAt(*booking.StartTime))
		
		if startErr != nil {
			log.Printf("❌ Failed to enqueue start task: %v", startErr)
		} else {
			log.Printf("✅ Task enqueued! Will execute at: %v (ID: %s)", booking.StartTime, startInfo.ID)
		}
	}
}