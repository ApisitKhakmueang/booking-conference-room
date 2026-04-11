package redisRepo

import (
	"context"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type RedisRepository interface {
	CreateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	UpdateBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	DeleteBooking(ctx context.Context,booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	CheckOutBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error)
	GetBookingByDay(ctx context.Context, date *domain.Date) ([]domain.Booking, error)
	GetUpNextBooking(ctx context.Context, endOfDay time.Time) (*domain.Booking, error)
	GetBooking(ctx context.Context, dateTime *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error)
	GetAnalyticBooking(ctx context.Context,date *domain.Date) ([]domain.Booking, error)
	GetBookingStatus(ctx context.Context) ([]domain.Booking, error)
	GetBookingStatusByRoomID(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error)
	GetUserBooking(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error)
	GetUserHistory(ctx context.Context,userID uuid.UUID, date string) ([]domain.Booking, error)
	GetRoom(ctx context.Context) ([]domain.Room, error)
	GetRoomByRoomNumber(ctx context.Context, roomNumber int) (*domain.Room, error)
	GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error)
	UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error)
	UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error)
}

type HelperRedisRepository interface {
	FindHolidaySynced(ctx context.Context, date *domain.Date) int64
	SetHolidaySynced(ctx context.Context, date *domain.Date) error
	DeleteHolidayCache(ctx context.Context, date *domain.Date) error
}