package domain

import (
	// "time"
	"context"

	"github.com/google/uuid"
)
// "github.com/gofiber/fiber/v2"

type BookingUsecase interface {
	// CreateBook(book *Books) error
	// GetBook(id uuid.UUID) (*Books, error)
	// GetBooks() ([]Books, error)
	// UpdateBook(book *Books) error 
	// DeleteBook(id uuid.UUID) error

	CreateBooking(ctx context.Context,booking *Booking, roomNumber uint) error
	UpdateBooking(ctx context.Context,booking *Booking, roomNumber uint) error
	DeleteBooking(ctx context.Context,bookingID uuid.UUID) error
	GetBooking(ctx context.Context,date *Date, roomNumber uint) ([]Booking, error)
	// GetUserBooking(ctx context.Context,userID uuid.UUID) ([]Booking, error)
	GetHoliday(ctx context.Context,date *Date) ([]Holiday, error)
	// CheckTimeUpdated(startDate string, endDate string) (*time.Time, error)
}