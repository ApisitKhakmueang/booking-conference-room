package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type BookingUsecases interface {
	CreateBooking(ctx context.Context, booking *Booking, roomNumber uint) error
	UpdateBooking(ctx context.Context, booking *Booking, roomNumber uint) error
	DeleteBooking(ctx context.Context, booking *Booking) error
	CheckOutBooking(ctx context.Context, booking *Booking) error
	CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) error
	GetBookingByDay(ctx context.Context, DateStr string) ([]Booking, error)
	GetUpNextBooking(ctx context.Context, date string) (*Booking, error)
	GetBooking(ctx context.Context, date *Date, roomNumber uint) ([]Booking, error)
	GetAnalyticBooking(ctx context.Context, date *Date) (*UpNextBookingResponse, error)
	GetBookingStatus(ctx context.Context) ([]Booking, error)
	GetBookingStatusByRoomID(ctx context.Context, roomID uuid.UUID) (*Booking, error)
	GetUserBooking(ctx context.Context, userID uuid.UUID, date string) ([]Booking, error)
	GetUserHistory(ctx context.Context, userID uuid.UUID, date string) ([]Booking, error)
}

type BookingRedisRepo interface {
	RedisCacheRepository
}

type BookingPostgresRepo interface {
	CreateBookingDB(ctx context.Context, booking *Booking) (*Booking, error)
	UpdateBookingDB(ctx context.Context, booking *Booking) (*Booking, error)
	DeleteBookingDB(ctx context.Context, booking *Booking) (*Booking, error)
	CheckOutBookingDB(ctx context.Context, booking *Booking) (*Booking, error)
	CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) error
	GetBookingByDayDB(ctx context.Context, date *Date) ([]Booking, error)
	GetUpNextBookingDB(ctx context.Context, endOfDay time.Time) (*Booking, error)
	GetBookingDB(ctx context.Context, dateTime *Date, roomID uuid.UUID) ([]Booking, error)
	GetAnalyticBookingDB(ctx context.Context,date *Date) ([]Booking, error)
	GetBookingStatusDB(ctx context.Context) ([]Booking, error)
	GetBookingStatusByRoomID_DB(ctx context.Context, roomID uuid.UUID) (*Booking, error)
	GetUserBookingDB(ctx context.Context, userID uuid.UUID, date string) ([]Booking, error)
	GetUserHistoryDB(ctx context.Context, userID uuid.UUID, date string) ([]Booking, error)
	UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, status string) (*Booking, error)
	GetConfigDB(ctx context.Context) (*Config, error)
	IsRoomAvailable(ctx context.Context, booking *Booking) bool
	IsPasscodeAvailable(ctx context.Context, booking *Booking, passcode string) bool
	GetRoomID(ctx context.Context, booking *Booking, roomNumber uint) error
	GetBookingByID(ctx context.Context, id uuid.UUID) (*Booking, error)
	CheckDayOff(ctx context.Context, date time.Time) error
	GetRoomDB(ctx context.Context) ([]Room, error)
	GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error)
}