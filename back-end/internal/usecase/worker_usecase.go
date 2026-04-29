package usecase

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type workerUsecase struct {
	*BaseUsecase
	cache          domain.WorkerRedisRepo // เรียกผ่าน Interface
	db domain.WorkerPostgresRepo // เรียกผ่าน Interface
}

// NewBookingUsecase คือ Constructor
func NewWorkerUsecase(
	pub		domain.RealtimePublisher,
	cache domain.WorkerRedisRepo,
	db domain.WorkerPostgresRepo,) domain.WorkerUsecase {
	return &workerUsecase{
		BaseUsecase: 		&BaseUsecase{publisher: pub},
		cache:          cache,
		db: 						db,
	}
}

func (u *workerUsecase) UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) error {
	roomNumber, err := u.db.GetRoomNumberDB(ctx, bookingID)
	if err != nil {
		return err
	}

	updateBooking, err := u.db.UpdateBookingStatusDB(ctx, bookingID, "complete")
	if err != nil {
		return err
	}

	prefixRoomNumber := fmt.Sprintf("booking:%d", roomNumber)
	prefixUser := fmt.Sprintf("booking:user:%s", updateBooking.UserID)
	prefixHistory := fmt.Sprintf("history:user:%s", updateBooking.UserID)
	u.cache.DeleteCache(ctx, prefixRoomNumber)
	u.cache.DeleteCache(ctx, prefixUser)
	u.cache.DeleteCache(ctx, prefixHistory)

	u.PublishEvent("booking_end", roomNumber, updateBooking)
	u.PublishStatus("booking_end", updateBooking)
	u.PublishRoomStatus("booking_end", updateBooking)

	return nil
}

func (u *workerUsecase) UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) error {
	roomNumber, err := u.db.GetRoomNumberDB(ctx, bookingID)
	if err != nil {
		return err
	}

	updateBooking, err := u.db.UpdateBookingStatusDB(ctx, bookingID, "no_show")
	if err != nil {
		return err
	}

	prefixRoomNumber := fmt.Sprintf("booking:%d", roomNumber)
	prefixUser := fmt.Sprintf("booking:user:%s", updateBooking.UserID)
	prefixHistory := fmt.Sprintf("history:user:%s", updateBooking.UserID)
	u.cache.DeleteCache(ctx, prefixRoomNumber)
	u.cache.DeleteCache(ctx, prefixUser)
	u.cache.DeleteCache(ctx, prefixHistory)

	u.PublishEvent("booking_noshow", roomNumber, updateBooking)
	u.PublishStatus("booking_noshow", updateBooking)
	u.PublishRoomStatus("booking_noshow", updateBooking)

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

	u.RunInBackground(5*time.Second, func(bgCtx context.Context) {
		if pubErr := u.publisher.PublishEvent(bgCtx, event, payload); pubErr != nil {
			log.Printf("Failed to publish real-time event: %v", pubErr)
		}
	})
}

func (u *workerUsecase) PublishStatus(event string, completedBooking *domain.Booking) {
	payload := map[string]interface{}{
		"status":  true,
		"booking": completedBooking, // ข้อมูล Booking ที่เพิ่งสร้างเสร็จ (มี ID แล้ว)
	}

	// log.Printf("Publishing real-time event: %v", payload)

	u.RunInBackground(5*time.Second, func(bgCtx context.Context) {
		if pubErr := u.publisher.PublishEvent(bgCtx, event, payload); pubErr != nil {
			log.Printf("Failed to publish real-time event: %v", pubErr)
		}
	})
}