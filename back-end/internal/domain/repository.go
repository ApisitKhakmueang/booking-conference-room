package domain

import (
	"time"

	"github.com/google/uuid"
)

type PostgresRepository interface {
	CreateBookingDB(booking *Booking) error
	UpdateBookingDB(booking *Booking) error
	DeleteBookingDB(bookingID uuid.UUID) error
	GetBookingDB(dateTime *Date, roomID uuid.UUID) ([]Booking, error)
	GetUserBookingDB(userID uuid.UUID) ([]Booking, error)
	
	GetHolidayDB(date *Date) ([]Holiday, error)
	DeleteHolidayCache(date *Date) error
	IsHolidaySynced(date *Date) bool
	SetHolidaySynced(date *Date) error

	GetRoomID(booking *Booking, roomNumber uint) error
	IsRoomAvailable(booking *Booking) bool
	IsPasscodeAvailable(booking *Booking, passcode string) bool 
	CheckDayOff(date time.Time) error

	BulkUpsertHolidays(holidays []Holiday) error

	// CheckLatestUpdateHoliday(startDate string, endDate string) (*time.Time, error)
	// GetEventID(bookingID uuid.UUID) (*Booking, error)
	// GetCalendar(roomNumber uint) (*Calendar, error)
	// GetUser(userID uuid.UUID) (*User, error)
	// CheckSameRoom(booking *Booking, roomNumber uint) error
}

// type RedisRepository interface {
// 	GetHolidayCache(start)
// }

type CalendarGateway interface {
	FetchHolidays(date *Date) ([]Holiday, error)
	// CreateEvent(booking *Booking, createEvent *CreateEvent) (string, error)
	// UpdateEventSameRoom(booking *Booking) error
	// CancelEvent(roomCalendarID string, eventID string) error

	// IsRoomAvailable(roomCalendarID string, Time *Date) error
	// IsRoomAvailableWithExclude(calendarID string, Time *Date, excludeEventID string) error
}