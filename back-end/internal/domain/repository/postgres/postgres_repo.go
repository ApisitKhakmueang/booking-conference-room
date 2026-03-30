package postgresRepo

import (
	"context"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type PostgresRepository interface {
	CreateBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error)
	UpdateBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error)
	DeleteBookingDB(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, error)
	GetBookingDB(ctx context.Context, dateTime *domain.Date, roomID uuid.UUID) ([]domain.Booking, error)
	GetBookingStatusDB(ctx context.Context) ([]domain.Booking, error)
	GetUserBookingDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error)
	GetRoomDetailsDB(ctx context.Context) ([]domain.Room, error)
	GetHolidayDB(ctx context.Context, date *domain.Date) ([]domain.Holiday, error)
	UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, status string) (*domain.Booking, error)

	GetRoomNumber(ctx context.Context, bookingID uuid.UUID) (uint, error)
	GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error)

	// CheckLatestUpdateHoliday(startDate string, endDate string) (*time.Time, error)
	// GetEventID(bookingID uuid.UUID) (*Booking, error)
	// GetCalendar(roomNumber uint) (*Calendar, error)
	// GetUser(userID uuid.UUID) (*User, error)
	// CheckSameRoom(booking *Booking, roomNumber uint) error
}

type HelperPostgresRepository interface {
	GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error)
	GetRoomID(ctx context.Context, booking *domain.Booking, roomNumber uint) error
	IsRoomAvailable(ctx context.Context, booking *domain.Booking) bool
	IsPasscodeAvailable(ctx context.Context, booking *domain.Booking, passcode string) bool
	CheckDayOff(ctx context.Context, date time.Time) error
	BulkUpsertHolidays(ctx context.Context, holidays []domain.Holiday) error
	GetRoomNumber(ctx context.Context, bookingID uuid.UUID) (uint, error)
}