package usecase

import (
	"context"
	"log"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type workerUsecase struct {
	BaseUsecase
	cache          domain.WorkerRedisRepo // เรียกผ่าน Interface
	db domain.WorkerPostgresRepo // เรียกผ่าน Interface
	publisher      domain.RealtimePublisher
}

// NewBookingUsecase คือ Constructor
func NewWorkerUsecase(
	pub		domain.RealtimePublisher,
	cache domain.WorkerRedisRepo,
	db domain.WorkerPostgresRepo,
	publisher domain.RealtimePublisher,) domain.WorkerUsecase {
	return &workerUsecase{
		BaseUsecase: NewBaseUsecase(pub),
		cache:          cache,
		db: db,
		publisher:      publisher,
	}
}

func (u *workerUsecase) UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) error {
	booking, roomNumber, err := u.cache.UpdateBookingEndStatus(ctx, bookingID)
	if err != nil {
		return err
	}

	u.PublishEvent("booking_end", roomNumber, booking)
	u.PublishStatus("booking_end", booking)
	u.PublishRoomStatus("booking_end", booking)
	// u.PublishStatus("booking_updated_status", booking)

	return nil
}

func (u *workerUsecase) UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) error {
	booking, roomNumber, err := u.cache.UpdateBookingNoshowStatus(ctx, bookingID)
	if err != nil {
		return err
	}

	u.PublishEvent("booking_noshow", roomNumber, booking)
	u.PublishStatus("booking_noshow", booking)
	u.PublishRoomStatus("booking_noshow", booking)
	// u.PublishStatus("booking_updated_status", booking)

	return nil
}

func (u *workerUsecase) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking, err := u.db.GetBookingByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (u *workerUsecase) PublishRoomStatus(event string, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"room_id": completedBooking.RoomID,
		"booking": completedBooking, // ข้อมูล Booking ที่เพิ่งสร้างเสร็จ (มี ID แล้ว)
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

func (u *workerUsecase) PublishStatus(event string, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"status":  true,
		"booking": completedBooking, // ข้อมูล Booking ที่เพิ่งสร้างเสร็จ (มี ID แล้ว)
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