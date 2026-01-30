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

type SearchFilter struct {
	Email   string `query:"email"` // จาก URL Query
	Room   	uint    `query:"room"`      // จาก URL Query
}

type CreateEvent struct {
	GoogleCalendarID 	string
	RoomName 					string
	SearchFilter
}

type BookingDetail struct {
	Email 		string
	StartTime string
	EndTime 	string
	Room 			uint
}

type Holiday struct {
	ID 				int64 			`gorm:"primaryKey;column:id" json:"id"`
	UpdatedAt time.Time 	`gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	Date 			time.Time 	`gorm:"type:date;column:date;unique" json:"date"`
	Name 			string 			`gorm:"type:text;column:name" json:"name"`
	IsDayOff 	bool 				`gorm:"column:is_day_off;default:true" json:"isDayOff"`
	Source 		string 			`gorm:"type:text;column:source" json:"source"`
}

type Room struct {
	ID        	uuid.UUID 			`gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt 	time.Time				`json:"createdAt"`
	UpdatedAt 	time.Time				`json:"updatedAt"`
	DeletedAt 	gorm.DeletedAt 	`gorm:"index" json:"deletedAt"`
	
	Name 				string 					`gorm:"unique" json:"name"`
	RoomNumber  uint						`json:"roomNumber"`
	Location 		string					`json:"location"`
	Capacity 		uint						`json:"capacity"`
	IsActive 		string 					`gorm:"type:varchar(20);default:'available';check:status IN ('available', 'maintenance')" json:"isActive"`
}

type User struct {
	ID 					uuid.UUID 	`gorm:"type:uuid;primaryKey" json:"id"`
	Email 			string 			`json:"email"`
	FullName 		string			`json:"fullName"`
	AvatarUrl 	string			`json:"avatarUrl"`
	Role				string			`json:"role"`
	CreatedAt 	time.Time		`json:"createdAt"`
}

type Calendar struct {
	ID        				uuid.UUID 					`gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt 				time.Time						`json:"createdAt"`
	UpdatedAt 				time.Time						`json:"updatedAt"`
	DeletedAt 				gorm.DeletedAt 			`gorm:"index" json:"deletedAt"`

	CalendarNumber 		uint 								`gorm:"default:0" json:"calendarNumber"`	
	GoogleCalendarID 	string 							`gorm:"unique;not null" json:"google_calendarId"`
	RoomID 						uuid.UUID 					`gorm:"not null" json:"roomId"`

	Room     					Room     						`gorm:"foreignKey:RoomID"`
}

type Booking struct {
	ID        		uuid.UUID 			`gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatedAt 		time.Time				`json:"createAt"`
	UpdatedAt 		time.Time				`json:"updatedAt"`

	RoomID        uuid.UUID       `gorm:"type:uuid;not null" json:"roomId"`
	UserID        uuid.UUID       `gorm:"type:uuid;not null" json:"userId"`
	CalendarID    uuid.UUID       `gorm:"type:uuid;not null" json:"calendarId"`
	GoogleEventID string         	`gorm:"type:text" json:"google_eventId"` // สำคัญมากสำหรับสถานะ cancelled
	
	StartTime     string      		`gorm:"not null" json:"startTime"`
	EndTime       string      		`gorm:"not null" json:"endTime"`
	
	// สถานะ: confirm, cancelled, complete
	Status        string         	`gorm:"type:varchar(20);default:'confirm';check:status IN ('confirm', 'cancelled', 'complete')" json:"status"`

	// Relations
	Room     			Room     				`gorm:"foreignKey:RoomID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	User     			User     				`gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Calendar 			Calendar 				`gorm:"foreignKey:CalendarID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}