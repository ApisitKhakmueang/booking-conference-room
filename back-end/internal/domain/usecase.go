package domain

import (
	// "time"

	"github.com/google/uuid"
)
// "github.com/gofiber/fiber/v2"

type OrderUsecase interface {
	// CreateBook(book *Books) error
	// GetBook(id uuid.UUID) (*Books, error)
	// GetBooks() ([]Books, error)
	// UpdateBook(book *Books) error 
	// DeleteBook(id uuid.UUID) error

	CreateBooking(booking *Booking, roomNumber uint) error
	UpdateBooking(booking *Booking, roomNumber uint) error
	DeleteBooking(bookingID uuid.UUID) error
	GetBooking(date string, filter *GetBookingFilter) ([]Schedule, error)
	GetUserBooking(userID uuid.UUID) ([]Booking, error)

	// GetCalendar(year int, month int) (*CalendarResponse, error)
	// CheckTimeUpdated(year uint, month uint) (*time.Time, error)
}