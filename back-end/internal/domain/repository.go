package domain

import (
	"time"

	"github.com/google/uuid"
)

type BookingRepository interface {
	// Create(book *Books) error
	// Get(id uuid.UUID) (*Books, error)
	// Gets() ([]Books, error)
	// Update(book *Books) error
	// Delete(id uuid.UUID) error

	CreateBookingDB(booking *Booking) error
	GetUserBookingDB(userID uuid.UUID) ([]Booking, error)
	GetBookingDB(dateTime *Date, roomID uuid.UUID) ([]Booking, error)
	UpdateBookingDB(booking *Booking) error
	DeleteBookingDB(bookingID uuid.UUID) error
	GetHolidayDB(startDate time.Time, endDate time.Time) ([]Holiday, error)

	BulkUpsertHolidays(holidays []Holiday) error
	GetEventID(bookingID uuid.UUID) (*Booking, error)
	GetCalendar(roomNumber uint) (*Calendar, error)
	GetUser(userID uuid.UUID) (*User, error)
	CheckSameRoom(booking *Booking, roomNumber uint) error
	CheckDayOff(date string) error
	CheckLatestUpdateHoliday(startDate time.Time, endDate time.Time) (*time.Time, error)
}

type CalendarGateway interface {
	CreateEvent(booking *Booking, createEvent *CreateEvent) (string, error)
	UpdateEventSameRoom(booking *Booking) error
	CancelEvent(roomCalendarID string, eventID string) error
	FetchHolidays(year int) ([]Holiday, error)

	IsRoomAvailable(roomCalendarID string, Time *Date) error
	IsRoomAvailableWithExclude(calendarID string, Time *Date, excludeEventID string) error
}