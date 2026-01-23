package domain

import (
	"github.com/google/uuid"
)

type OrderRepository interface {
	Create(book *Books) error
	Get(id uuid.UUID) (*Books, error)
	Gets() ([]Books, error)
	Update(book *Books) error
	Delete(id uuid.UUID) error
}