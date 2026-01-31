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
	GetMonthBookingDB(dateTime *Date, roomID uuid.UUID) (*[]Booking, error)
	UpdateBookingDB(booking *Booking) error
	DeleteBookingDB(bookingID uuid.UUID) error

	GetEventID(bookingID uuid.UUID) (*Booking, error)
	GetCalendar(roomNumber uint) (*Calendar, error)
	CheckSameRoom(booking *Booking, roomNumber uint) error
	CheckDayOff(date string) error
}

type CalendarGateway interface {
	CreateEvent(booking *Booking, createEvent *CreateEvent) (string, error)
	UpdateEventSameRoom(booking *Booking) error
	CancelEvent(roomCalendarID string, eventID string) error

	IsRoomAvailable(roomCalendarID string, Time []string) error
	ParseTime(booking *Booking) ([]string, error)
	CheckValidTime(startTime time.Time, endTime time.Time) error
}