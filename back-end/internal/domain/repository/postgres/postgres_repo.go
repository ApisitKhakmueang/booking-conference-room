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
	DeleteBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error)
	CheckOutBookingDB(ctx context.Context, booking *domain.Booking) (*domain.Booking, error)
	GetBookingByDayDB(ctx context.Context, date *domain.Date) ([]domain.Booking, error)
	GetUpNextBookingDB(ctx context.Context, endOfDay time.Time) (*domain.Booking, error)
	GetBookingDB(ctx context.Context, dateTime *domain.Date, roomID uuid.UUID) ([]domain.Booking, error)
	GetAnalyticBookingDB(ctx context.Context,date *domain.Date) ([]domain.Booking, error)
	GetBookingStatusDB(ctx context.Context) ([]domain.Booking, error)
	GetBookingStatusByRoomID_DB(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error)
	GetUserBookingDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error)
	GetUserHistoryDB(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error)
	GetHolidayDB(ctx context.Context, date *domain.Date) ([]domain.Holiday, error)
	UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, status string) (*domain.Booking, error)
	
	CreateRoomDB(ctx context.Context, room *domain.Room) error
	UpdateRoomDB(ctx context.Context, room *domain.Room) error
	DeleteRoomDB(ctx context.Context, roomID uuid.UUID) error
	GetRoomDB(ctx context.Context) ([]domain.Room, error)
	GetRoomByID_DB(ctx context.Context, roomID uuid.UUID) (*domain.Room, error)
	GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error)
	GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error)

	// CheckLatestUpdateHoliday(startDate string, endDate string) (*time.Time, error)
	// GetEventID(bookingID uuid.UUID) (*Booking, error)
	// GetCalendar(roomNumber uint) (*Calendar, error)
	// GetUser(userID uuid.UUID) (*User, error)
	// CheckSameRoom(booking *Booking, roomNumber uint) error
}

type HelperPostgresRepository interface {
	CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) error
	GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error)
	GetRoomID(ctx context.Context, booking *domain.Booking, roomNumber uint) error
	IsRoomAvailable(ctx context.Context, booking *domain.Booking) bool
	IsPasscodeAvailable(ctx context.Context, booking *domain.Booking, passcode string) bool
	CheckDayOff(ctx context.Context, date time.Time) error
	BulkUpsertHolidays(ctx context.Context, holidays []domain.Holiday) error
	GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error)
	GetConfigDB(ctx context.Context) (*domain.Config, error)
	UpdateConfigDB(ctx context.Context, config *domain.Config) error
	GetPaginatedUsersDB(ctx context.Context, q *domain.UserPaginationQuery) ([]domain.User, int64, error)
	GetUserOverviewDB(ctx context.Context, userID uuid.UUID) (*domain.UserOverviewResponse, error)
}