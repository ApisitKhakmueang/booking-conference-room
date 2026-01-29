package domain

import (
	"github.com/google/uuid"
)

type BookingRepository interface {
	Create(book *Books) error
	Get(id uuid.UUID) (*Books, error)
	Gets() ([]Books, error)
	Update(book *Books) error
	Delete(id uuid.UUID) error

	CreateBookingDB(booking *Booking) error
	GetCalendar(roomNumber uint) (*Calendar, error)
}

type CalendarGateway interface {
	CreateEvent(booking *Booking, googleCalendarID string, filter *SearchFilter) (string, error)
	UpdateEvent(booking *Booking, googleCalendarID string, filter *SearchFilter) error
	CancelEvent(roomCalendarID string, eventID string) error
	IsRoomAvailable(roomCalendarID string, Time []string) error
	ParseTime(booking *Booking) ([]string, error)
}