package domain

import (
	"time"

	"github.com/google/uuid"
)

type Books struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `json:"name"`
}