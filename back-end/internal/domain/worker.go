package domain

import (
	"context"

	"github.com/google/uuid"
)

type WorkerUsecase interface {
	UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) error
	UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) error
	GetBookingByID(ctx context.Context, id uuid.UUID) (*Booking, error)
	PublishRoomStatus(event string, completedBooking *Booking)
	PublishStatus(event string, completedBooking *Booking)
}

type WorkerRedisRepo interface {
	UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) (*Booking, uint, error)
	UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) (*Booking, uint, error)
}

type WorkerPostgresRepo interface {
	GetBookingByID(ctx context.Context, id uuid.UUID) (*Booking, error)
	GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error)
	UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, status string) (*Booking, error)
}