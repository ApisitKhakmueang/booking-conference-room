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
	GetBookingByDay(ctx context.Context, DateStr string) ([]Booking, error)
	GetUpNextBooking(ctx context.Context, date string) (*Booking, error)
	GetBooking(ctx context.Context,date *Date, roomNumber uint) ([]Booking, error)
	GetAnalyticBooking(ctx context.Context, date *Date) (*UpNextBookingResponse, error)
	GetBookingStatus(ctx context.Context) ([]Booking, error)
	GetBookingStatusByRoomID(ctx context.Context, roomID uuid.UUID) (*Booking, error)
	GetUserBooking(ctx context.Context,userID uuid.UUID, date string) ([]Booking, error)
	GetUserHistory(ctx context.Context,userID uuid.UUID, date string) ([]Booking, error)

	CreateRoom(ctx context.Context, room *Room) error
	UpdateRoom(ctx context.Context, room *Room) error
	DeleteRoom(ctx context.Context, roomID uuid.UUID) error
	GetRoom(ctx context.Context) ([]Room, error)
	GetRoomByID(ctx context.Context, roomID uuid.UUID) (*Room, error)
	GetHoliday(ctx context.Context,date *Date) ([]Holiday, error)
	GetConfigTime(ctx context.Context) (*Config, error)

	UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) error
	UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) error
	GetBookingByID(ctx context.Context, id uuid.UUID) (*Booking, error)
	PublishRoomStatus(event string, completedBooking *Booking)
	PublishStatus(event string, completedBooking *Booking)
}