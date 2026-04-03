package redisRepo

import (
	"context"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type RedisRepository interface {
	CreateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	UpdateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	DeleteBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	CheckoutBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	GetBooking(ctx context.Context, dateTime *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error)
	GetBookingStatus(ctx context.Context, timeStart string) ([]domain.Booking, error)
	GetUserBooking(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error)
	GetUserHistory(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error)
	GetRoomDetails(ctx context.Context) ([]domain.Room, error)
	GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error)
	UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error)
}

type HelperRedisRepository interface {
	FindHolidaySynced(ctx context.Context, date *domain.Date) int64
	SetHolidaySynced(ctx context.Context, date *domain.Date) error
	DeleteHolidayCache(ctx context.Context, date *domain.Date) error
}