package domain

import (
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type Books struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `json:"name"`
}

type Room struct {
	gorm.Model
	Name 				string 	`gorm:"unique"`
	Location 		string
	Capacity 		uint
	IsActive 		string 	`gorm:"type:varchar(20);default:'available';check:status IN ('available', 'maintenance')"`
}

type User struct {
	ID 					uuid.UUID `gorm:"type:uuid;primaryKey"`
	Email 			string 
	FullName 		string
	AvatarUrl 	string
	Role				string
	CreatedAt 	time.Time
}

type Calendar struct {
	gorm.Model
	CalendarNumber 		uint 				`gorm:"default:0"`	
	GoogleCalendarID 	string 			`gorm:"unique;not null"`
	RoomID 						uuid.UUID 	`gorm:"not null"`

	Room     Room     `gorm:"foreignKey:RoomID"`
}

type Booking struct {
	gorm.Model
	RoomID        uint           `gorm:"not null"`
	UserID        uint           `gorm:"not null"`
	CalendarID    uint           `gorm:"not null"`
	GoogleEventID string         `gorm:"type:text"` // สำคัญมากสำหรับสถานะ cancelled
	
	StartTime     time.Time      `gorm:"not null"`
	EndTime       time.Time      `gorm:"not null"`
	
	// สถานะ: confirm, cancelled, complete
	Status        string         `gorm:"type:varchar(20);default:'confirm';check:status IN ('confirm', 'cancelled', 'complete')"`

	// Relations
	Room     Room     `gorm:"foreignKey:RoomID"`
	User     User     `gorm:"foreignKey:UserID"`
	Calendar Calendar `gorm:"foreignKey:CalendarID"`
}