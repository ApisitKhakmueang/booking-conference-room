package usercase

import (
	// "fmt"
	"context"
	"log"
	"sort"
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

	if err := helper.CheckBeforeNow(*booking.StartTime); err != nil {
		return err
	}

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

	booking.Passcode = &finalPasscode
	booking.ID = uuid.New()

	booking, err := u.redis.CreateBooking(ctx, booking, roomNumber)
	if err != nil {
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

	if err := helper.CheckBeforeNow(*booking.StartTime); err != nil {
		return err
	}

	if err := helper.CheckMaxAdvanceBooking(*booking.StartTime); err != nil {
		return err
	}

	if err := u.helperPostgres.GetRoomID(ctx, booking, roomNumber); err != nil {
		return err
	}

	if !u.helperPostgres.IsRoomAvailable(ctx, booking) {
		return errors.New("Room unavailable")
	}

	booking, err := u.redis.UpdateBooking(ctx, booking, roomNumber);
	if  err != nil {
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

	return nil
}

func (u *bookingUsecase) DeleteBooking(ctx context.Context,booking *domain.Booking) error {
	log.Println("GetBookingByID from DeleteBooking")
	completedBooking, err := u.GetBookingByID(ctx, booking.ID)
	if err != nil {
		return err
	}

	// if err := helper.CheckBeforeOneHour(*completedBooking.StartTime); err != nil {
	// 	return err
	// }

	deletedBooking, err := u.redis.DeleteBooking(ctx, completedBooking, completedBooking.Room.RoomNumber);
	if err != nil {
		return errors.New("Don't have this booking")
	}

	u.PublishEvent("booking_deleted", completedBooking.Room.RoomNumber, deletedBooking)
	u.PublishStatus("booking_deleted", completedBooking)

	return nil
}

func (u *bookingUsecase) CheckOutBooking(ctx context.Context,booking *domain.Booking) error {
	log.Println("GetBookingByID from CheckOutBooking")
	completedBooking, err := u.GetBookingByID(ctx, booking.ID)
	if err != nil {
		return err
	}

	// if err := helper.CheckBeforeOneHour(*completedBooking.StartTime); err != nil {
	// 	return err
	// }

	deletedBooking, err := u.redis.CheckOutBooking(ctx, completedBooking, completedBooking.Room.RoomNumber);
	if err != nil {
		return errors.New("Don't have this booking")
	}

	u.PublishEvent("booking_deleted", completedBooking.Room.RoomNumber, deletedBooking)
	u.PublishStatus("booking_deleted", completedBooking)

	return nil
}

func (u *bookingUsecase) CheckInBooking(ctx context.Context,roomID uuid.UUID, passcode string) error {
	if err := u.helperPostgres.CheckInBooking(ctx, roomID, passcode); err != nil {
		return err
	}

	return nil
}

func (u *bookingUsecase) GetBookingByDay(ctx context.Context, DateStr string) ([]domain.Booking, error) {
	layout := "2006-01-02"
	startTime, err := helper.ParseTimeFormat(layout, DateStr)
	if err != nil {
		return nil, err
	}

	endTime := startTime.AddDate(0, 0, 1)
	var date domain.Date
	date.StartStr = startTime.Format(layout)
	date.EndStr = endTime.Format(layout)
	
	bookings, err := u.redis.GetBookingByDay(ctx, &date)
	if err != nil {
		return nil, err
	}
	
	return bookings, nil
}

func (u *bookingUsecase) GetUpNextBooking(ctx context.Context, date string) (*domain.Booking, error) {
	layout := "2006-01-02"
	startTime, err := helper.ParseTimeFormat(layout, date)
	if err != nil {
		return nil, err
	}

	endTime := startTime.AddDate(0, 0, 1)
	booking, err := u.redis.GetUpNextBooking(ctx, endTime)
	if err != nil {
		return nil, err
	}

	return booking, nil
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

// แนะนำให้แก้ Return Type เป็น Object เดียว (pointer) ครับ
func (u bookingUsecase) GetAnalyticBooking(ctx context.Context, date *domain.Date) (*domain.UpNextBookingResponse, error) {
	bookings, err := u.redis.GetAnalyticBooking(ctx, date)
	if err != nil {
		return nil, err
	}

	totalBookings := len(bookings)

	// ⭐️ ป้องกันบั๊ก: ถ้าไม่มีการจองเลย ให้ส่งค่าว่างกลับไปทันที ไม่งั้นตอนหาร % โปรแกรมจะพัง (Divide by zero)
	if totalBookings == 0 {
		return &domain.UpNextBookingResponse{}, nil
	}

	var health domain.AttendanceHealth
	
	// ใช้ Struct ชั่วคราวเพื่อเก็บข้อมูลห้องพร้อมยอด Count
	type roomStat struct {
		ID 					uuid.UUID
		RoomNumber 	uint
		Name       	string
		Count      	int
	}
	
	// ใช้ RoomNumber (int) เป็น Key ของ Map
	mapPopularRooms := make(map[uint]*roomStat)

	// 1. วนลูปเพื่อนับจำนวนต่างๆ (Loop ครั้งเดียวได้ครบทุกอย่าง)
	for _, booking := range bookings {
		
		// --- คำนวณ Attendance Health ---
		if booking.Status != nil {
			switch *booking.Status {
			case "complete":
				health.Completed++
			case "cancelled":
				health.Cancelled++
			case "no_show":
				health.NoShow++
			}
		}

		// --- รวบรวม Popular Rooms ---
		if booking.Room != nil {
			roomNum := booking.Room.RoomNumber
			if stat, exists := mapPopularRooms[roomNum]; exists {
				stat.Count++ // ถัามีห้องนี้ใน map แล้ว ให้นับเพิ่ม
			} else {
				// ถ้ายังไม่มี ให้สร้างใหม่
				mapPopularRooms[roomNum] = &roomStat{
					ID:         booking.Room.ID,
					RoomNumber: roomNum,
					Name:       booking.Room.Name,
					Count:      1,
				}
			}
		}
	}

	// 2. คำนวณเปอร์เซ็นต์ของ Attendance Health (ปัดเศษทิ้งเป็นจำนวนเต็ม)
	health.CompletionRate = (health.Completed * 100) / totalBookings
	health.CanCelledRate = (health.Cancelled * 100) / totalBookings
	health.NoShowRate = (health.NoShow * 100) / totalBookings

	// 3. แปลง Map ของห้อง กลับไปเป็น Array (Slice) และคำนวณเปอร์เซ็นต์ความนิยม
	var popularRooms []domain.PopularRoom
	for _, stat := range mapPopularRooms {
		popularRooms = append(popularRooms, domain.PopularRoom{
			ID:         stat.ID,
			RoomNumber: stat.RoomNumber,
			Name:       stat.Name,
			Percentage: (stat.Count * 100) / totalBookings,
		})
	}

	// 4. เรียงลำดับ (Sort) ห้องที่ป๊อปปูล่าที่สุด (เปอร์เซ็นต์มากสุด) ให้อยู่ข้างบนเสมอ
	sort.Slice(popularRooms, func(i, j int) bool {
		return popularRooms[i].Percentage > popularRooms[j].Percentage
	})

	// 5. ประกอบร่างเป็น Response และส่งกลับ
	response := domain.UpNextBookingResponse{
		AttendanceHealth: health,
		PopularRooms:     popularRooms[:3],
	}

	return &response, nil
}

func (u *bookingUsecase) GetBookingStatus(ctx context.Context) ([]domain.Booking, error) {
	booking, err := u.redis.GetBookingStatus(ctx)
	if err != nil {
		return nil, err
	}

	// log.Printf("booking: %v", booking)
	return booking, nil
}

func (u *bookingUsecase) GetBookingStatusByRoomID(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error) {
	booking, err := u.redis.GetBookingStatusByRoomID(ctx, roomID)
	if err != nil {
		return nil, err
	}

	// log.Printf("booking: %v", booking)
	return booking, nil
}

func (u *bookingUsecase) GetUserBooking(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error) {
	bookings, err := u.redis.GetUserBooking(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	return bookings, nil
}

func (u *bookingUsecase) GetUserHistory(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error) {
	bookings, err := u.redis.GetUserHistory(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	return bookings, nil
}

func (u *bookingUsecase) GetRoom(ctx context.Context) ([]domain.Room, error) {
	rooms, err := u.redis.GetRoom(ctx)
	if err != nil {
		return nil, err
	}

	return rooms, nil
}

func (u *bookingUsecase) GetRoomByRoomNumber(ctx context.Context, roomNumber int) (*domain.Room, error) {
	room, err := u.redis.GetRoomByRoomNumber(ctx, roomNumber)
	if err != nil {
		return nil, err
	}

	return room, nil
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

// Helper function
func (u *bookingUsecase) UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) error {
	booking, roomNumber, err := u.redis.UpdateBookingEndStatus(ctx, bookingID);
	if err != nil {
		return err
	}

	u.PublishEvent("booking_end", roomNumber, booking)
	u.PublishStatus("booking_end", booking)
	u.PublishRoomStatus("booking_end", booking)
	// u.PublishStatus("booking_updated_status", booking)

	return nil
}

func (u *bookingUsecase) UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) error {
	booking, roomNumber, err := u.redis.UpdateBookingNoshowStatus(ctx, bookingID);
	if err != nil {
		return err
	}

	u.PublishEvent("booking_noshow", roomNumber, booking)
	u.PublishStatus("booking_noshow", booking)
	u.PublishRoomStatus("booking_noshow", booking)
	// u.PublishStatus("booking_updated_status", booking)

	return nil
}

func (u *bookingUsecase) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	log.Println("GetBookingByID from GetBookingByID in service")
	booking, err := u.helperPostgres.GetBookingByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (u *bookingUsecase) PublishRoomStatus(event string, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"room_id":	completedBooking.RoomID,
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
	// ป้องกันเหนียวไว้ก่อน: เช็คว่าเวลาไม่เป็น nil แน่ๆ ป้องกันระบบ Panic
	if booking.StartTime == nil || booking.EndTime == nil {
		log.Println("❌ Error: StartTime or EndTime is nil. Cannot enqueue tasks.")
		return
	}

	// ---------------------------------------------------
	// 1. งานเริ่มต้น (Start Task)
	// ---------------------------------------------------
	startTask, err := worker.NewBookingStartTask(booking.ID)
	if err == nil {
		info, err := u.asynqClient.Enqueue(startTask, asynq.ProcessAt(*booking.StartTime))
		if err != nil {
			log.Printf("❌ Failed to enqueue start task: %v", err)
		} else {
			log.Printf("✅ Start Task enqueued! Will execute at: %v (ID: %s)", *booking.StartTime, info.ID)
		}
	} else {
		log.Printf("❌ Failed to create start task: %v", err)
	}

	// ---------------------------------------------------
	// 2. งานเช็คคนไม่มา (No-Show Task) -> StartTime + 15 นาที
	// ---------------------------------------------------
	noshowTask, err := worker.NewBookingNoShowTask(booking.ID)
	if err == nil {
		noshowTime := (*booking.StartTime).Add(15 * time.Minute) // ⭐️ ดึงค่าออกมาด้วย * ก่อนบวกเวลา
		info, err := u.asynqClient.Enqueue(noshowTask, asynq.ProcessAt(noshowTime))
		if err != nil {
			log.Printf("❌ Failed to enqueue noshow task: %v", err)
		} else {
			log.Printf("✅ No-Show Task enqueued! Will execute at: %v (ID: %s)", noshowTime, info.ID)
		}
	} else {
		log.Printf("❌ Failed to create noshow task: %v", err)
	}

	// ---------------------------------------------------
	// 3. งานหมดเวลา (Expired/End Task)
	// ---------------------------------------------------
	endTask, err := worker.NewBookingExpiredTask(booking.ID)
	if err == nil {
		info, err := u.asynqClient.Enqueue(endTask, asynq.ProcessAt(*booking.EndTime))
		if err != nil {
			log.Printf("❌ Failed to enqueue end task: %v", err)
		} else {
			log.Printf("✅ End Task enqueued! Will execute at: %v (ID: %s)", *booking.EndTime, info.ID)
		}
	} else {
		log.Printf("❌ Failed to create end task: %v", err)
	}
}