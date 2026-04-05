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
	DeleteBooking(ctx context.Context,booking *Booking) error
	CheckOutBooking(ctx context.Context,booking *Booking) error
	CheckInBooking(ctx context.Context, roomID uuid.UUID, passcode string) (error)
	GetBooking(ctx context.Context,date *Date, roomNumber uint) ([]Booking, error)
	GetBookingStatus(ctx context.Context) ([]Booking, error)
	GetSingleBookingStatus(ctx context.Context, roomNumber int) (*Booking, error)
	GetUserBooking(ctx context.Context,userID uuid.UUID, date string) ([]Booking, error)
	GetUserHistory(ctx context.Context,userID uuid.UUID, date string) ([]Booking, error)
	GetRoomDetails(ctx context.Context) ([]Room, error)
	GetSingleRoomDetails(ctx context.Context, roomNumber int) (*Room, error)
	GetHoliday(ctx context.Context,date *Date) ([]Holiday, error)

	UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) error
	UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) error
	GetBookingByID(ctx context.Context, id uuid.UUID) (*Booking, error)
	PublishRoomStatus(event string, completedBooking *Booking)
	PublishStatus(event string, completedBooking *Booking)
}