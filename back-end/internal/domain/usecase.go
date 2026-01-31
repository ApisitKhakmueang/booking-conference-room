package domain

import "github.com/google/uuid"

// "github.com/google/uuid"
// "github.com/gofiber/fiber/v2"

type OrderUsecase interface {
	// CreateBook(book *Books) error
	// GetBook(id uuid.UUID) (*Books, error)
	// GetBooks() ([]Books, error)
	// UpdateBook(book *Books) error 
	// DeleteBook(id uuid.UUID) error

	CreateBooking(booking *Booking, roomNumber uint) error
	GetBooking(date string, filter *GetBookingFilter) ([]Schedule, error)
	UpdateBooking(booking *Booking, roomNumber uint) error
	DeleteBooking(bookingID uuid.UUID) error
}