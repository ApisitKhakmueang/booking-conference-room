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
}

type CalendarGateway interface {
	CreateEvent() (string, error)
	UpdateEvent() (string, error)
	CancelEvent() (string, error)
}