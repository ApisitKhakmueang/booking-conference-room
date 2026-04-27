package usecase

import (
	"context"
	"errors"
	"log"
	"sort"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/worker"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

type bookingUsecases struct {
	BaseUsecase
	cache					domain.BookingRedisRepo // เรียกผ่าน Interface
	db						domain.BookingPostgresRepo // เรียกผ่าน Interface
	asynqClient		*asynq.Client
}

func NewBookingUsecases(
	pub						domain.RealtimePublisher,
	cache 				domain.BookingRedisRepo,
	db 						domain.BookingPostgresRepo,
	asynqClient		*asynq.Client) domain.BookingUsecases {
	return &bookingUsecases{
		BaseUsecase: 	NewBaseUsecase(pub),
		cache:				cache,
		db:   				db,
		asynqClient: 	asynqClient,
	}
}

func (u *bookingUsecases) CreateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) error {
	configTime, err := u.db.GetConfigDB(ctx)
	if err != nil {
		return err
	}

	if err := u.ValidateBooking(ctx, booking, roomNumber, configTime); err != nil {
		return err
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
		if u.db.IsPasscodeAvailable(ctx,booking, passcode) {
			finalPasscode = passcode // เย้! ว่าง -> เก็บค่าไว้
			break                    // หยุดวนลูป
		}

		// ถ้าไม่ว่าง (Else): มันจะวนกลับไปสุ่มเลขใหม่เอง ("5678" -> เช็คใหม่)
	}

	booking.Passcode = &finalPasscode
	booking.ID = uuid.New()

	booking, err = u.cache.CreateBooking(ctx, booking, roomNumber)
	if err != nil {
		return err
	}

	u.PublishEvent("booking_created", roomNumber, booking)

	go func(b *domain.Booking, noShowThresoldMins int) {
		u.EnqeueEvent(b, noShowThresoldMins)
	}(booking, configTime.NoShowThresholdMins)

	return nil
}

func (u *bookingUsecases) UpdateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) error {
	configTime, err := u.db.GetConfigDB(ctx)
	if err != nil {
		return err
	}

	if err := u.ValidateBooking(ctx, booking, roomNumber, configTime); err != nil {
		return err
	}

	booking, err = u.cache.UpdateBooking(ctx, booking, roomNumber);
	if  err != nil {
		return err
	}
		
	u.PublishEvent("booking_updated", roomNumber, booking)

	go func(b *domain.Booking, noShowThresoldMins int) {
		u.EnqeueEvent(b, noShowThresoldMins)
	}(booking, configTime.NoShowThresholdMins)

	return nil
}

func (u *bookingUsecases) DeleteBooking(ctx context.Context,booking *domain.Booking) error {
	completedBooking, err := u.GetBookingByID(ctx, booking.ID)
	if err != nil {
		return err
	}

	// if err := helper.CheckBeforeOneHour(*completedBooking.StartTime); err != nil {
	// 	return err
	// }

	deletedBooking, err := u.cache.DeleteBooking(ctx, completedBooking, completedBooking.Room.RoomNumber);
	if err != nil {
		return errors.New("Don't have this booking")
	}

	u.PublishEvent("booking_deleted", completedBooking.Room.RoomNumber, deletedBooking)
	u.PublishStatus("booking_deleted", completedBooking)

	return nil
}

func (u *bookingUsecases) CheckOutBooking(ctx context.Context,booking *domain.Booking) error {
	completedBooking, err := u.GetBookingByID(ctx, booking.ID)
	if err != nil {
		return err
	}

	// if err := helper.CheckBeforeOneHour(*completedBooking.StartTime); err != nil {
	// 	return err
	// }

	deletedBooking, err := u.cache.CheckOutBooking(ctx, completedBooking, completedBooking.Room.RoomNumber);
	if err != nil {
		return errors.New("Don't have this booking")
	}

	u.PublishEvent("booking_deleted", completedBooking.Room.RoomNumber, deletedBooking)
	u.PublishStatus("booking_deleted", completedBooking)

	return nil
}

func (u *bookingUsecases) CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) error {
	if err := u.db.CheckInBooking(ctx, roomID, passcode); err != nil {
		return err
	}

	return nil
}

func (u *bookingUsecases) GetBookingByDay(ctx context.Context, DateStr string) ([]domain.Booking, error) {
	layout := "2006-01-02"
	startTime, err := helper.ParseTimeFormat(layout, DateStr)
	if err != nil {
		return nil, err
	}

	endTime := startTime.AddDate(0, 0, 1)
	var date domain.Date
	date.StartStr = startTime.Format(layout)
	date.EndStr = endTime.Format(layout)
	
	bookings, err := u.cache.GetBookingByDay(ctx, &date)
	if err != nil {
		return nil, err
	}
	
	return bookings, nil
}

func (u *bookingUsecases) GetUpNextBooking(ctx context.Context, date string) (*domain.Booking, error) {
	layout := "2006-01-02"
	startTime, err := helper.ParseTimeFormat(layout, date)
	if err != nil {
		return nil, err
	}

	endTime := startTime.AddDate(0, 0, 1)
	booking, err := u.cache.GetUpNextBooking(ctx, endTime)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (u *bookingUsecases) GetBooking(ctx context.Context,date *domain.Date, roomNumber uint) ([]domain.Booking, error) {
	var response []domain.Booking
	instBooking := new(domain.Booking)
	if err := u.db.GetRoomID(ctx, instBooking, roomNumber); err != nil {
		return nil, err
	}

	bookings, err := u.cache.GetBooking(ctx, date, instBooking.RoomID, roomNumber)
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

func (u bookingUsecases) GetAnalyticBooking(ctx context.Context, date *domain.Date) (*domain.UpNextBookingResponse, error) {
	bookings, err := u.cache.GetAnalyticBooking(ctx, date)
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

func (u *bookingUsecases) GetBookingStatus(ctx context.Context) ([]domain.Booking, error) {
	booking, err := u.cache.GetBookingStatus(ctx)
	if err != nil {
		return nil, err
	}

	// log.Printf("booking: %v", booking)
	return booking, nil
}

func (u *bookingUsecases) GetBookingStatusByRoomID(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error) {
	booking, err := u.cache.GetBookingStatusByRoomID(ctx, roomID)
	if err != nil {
		return nil, err
	}

	// log.Printf("booking: %v", booking)
	return booking, nil
}

func (u *bookingUsecases) GetUserBooking(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error) {
	bookings, err := u.cache.GetUserBooking(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	return bookings, nil
}

func (u *bookingUsecases) GetUserHistory(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error) {
	bookings, err := u.cache.GetUserHistory(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	return bookings, nil
}

// Internal Function
func (u *bookingUsecases) EnqeueEvent(booking *domain.Booking, noShowThresholdMins int) {
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
	if noShowThresholdMins > 0 {
		noshowTask, err := worker.NewBookingNoShowTask(booking.ID)
		if err == nil {
			// ✅ แก้ไข: แปลง int เป็น time.Duration เพื่อให้คำนวณได้
			threshold := time.Duration(noShowThresholdMins) * time.Minute
			noshowTime := booking.StartTime.Add(threshold)

			info, err := u.asynqClient.Enqueue(noshowTask, asynq.ProcessAt(noshowTime))
			if err != nil {
				log.Printf("❌ Failed to enqueue noshow task: %v", err)
			} else {
				log.Printf("✅ No-Show Task enqueued! Will execute at: %v (ID: %s)", noshowTime, info.ID)
			}
		} else {
			log.Printf("❌ Failed to create noshow task: %v", err)
		}
	} else {
		log.Printf("Skip No-Show Task: Threshold is 0")
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

func (u *bookingUsecases) ValidateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint, config *domain.Config) error {
	openMinutes, _ := helper.TotalMinutesFromString(config.StartTime)
	closeMinutes, _ := helper.TotalMinutesFromString(config.EndTime)

	if err := u.db.CheckDayOff(ctx, *booking.StartTime); err != nil {
		return err
	}

	err := helper.ValidateBusinessHours(*booking.StartTime, *booking.EndTime, openMinutes, closeMinutes)
	if err != nil {
		return err
	}

	if err := helper.CheckBeforeNow(*booking.StartTime); err != nil {
		return err
	}

	if err := helper.CheckMaxAdvanceBooking(*booking.StartTime, config.MaxAdvanceDays); err != nil {
		return err
	}

	if err := helper.CheckTimeLimit(*booking.StartTime, *booking.EndTime, config.MaxBookingMins); err != nil {
		return err
	}

	if err := u.db.GetRoomID(ctx, booking, roomNumber); err != nil {
		return err
	}

	if !u.db.IsRoomAvailable(ctx, booking) {
		return errors.New("Room unavailable")
	}

	return nil
}

func (u *bookingUsecases) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking, err := u.db.GetBookingByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (u *bookingUsecases) PublishStatus(event string, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"status":		true,
		"booking":	completedBooking, // ข้อมูล Booking ที่เพิ่งสร้างเสร็จ (มี ID แล้ว)
	}

	go func() {
		// ต้องใช้ context.Background() เพราะ ctx เดิมอาจจะหมดอายุตอน API จบ
		bgCtx := context.Background()
		if pubErr := u.publisher.PublishEvent(bgCtx, event, payload); pubErr != nil {
			log.Printf("Failed to publish real-time event: %v", pubErr)
		}
	}()
}