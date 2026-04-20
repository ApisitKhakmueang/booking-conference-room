package domain

import (
	"fmt"
	"strings"
	"time"
	"database/sql/driver"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Books struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `json:"name"`
}

// 1. สร้าง Type ใหม่ชื่อ Date
type DateRes time.Time

// 2. Implement MarshalJSON: กำหนดหน้าตาตอนเป็น JSON
func (d DateRes) MarshalJSON() ([]byte, error) {
	t := time.Time(d)
	// จัด Format เป็น YYYY-MM-DD และต้องใส่เครื่องหมาย " ครอบด้วย
	formatted := fmt.Sprintf("\"%s\"", t.Format("2006-01-02"))
	return []byte(formatted), nil
}

// 3. Implement UnmarshalJSON: รองรับการรับค่า JSON เข้ามา
func (d *DateRes) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return err
	}
	*d = DateRes(t)
	return nil
}

// 4. Implement Value: ให้ GORM รู้ว่าจะเซฟลง DB ยังไง
func (d DateRes) Value() (driver.Value, error) {
	return time.Time(d), nil
}

// 5. Implement Scan: ให้ GORM รู้ว่าจะดึงจาก DB มาใส่ตัวแปรยังไง
func (d *DateRes) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	
	switch v := value.(type) {
	case time.Time:
		*d = DateRes(v)
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return err
		}
		*d = DateRes(t)
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return err
		}
		*d = DateRes(t)
	}
	return nil
}

// Helper: แปลงกลับเป็น time.Time ปกติ (เผื่อต้องเอาไปคำนวณบวกลบวัน)
func (d DateRes) Time() time.Time {
	return time.Time(d)
}

// Schema
type Config struct {
	ID        					int64  	`gorm:"primaryKey;column:id" json:"id,omitempty"`
	StartTime 					string 	`gorm:"not null;column:start_time" json:"startTime,omitempty"` // เช่น "08:00"
	EndTime   					string 	`gorm:"not null;column:end_time" json:"endTime,omitempty"`   // เช่น "20:00"
	MaxAdvanceDays 			int 		`gorm:"not null;column:max_advance_days;default:30" json:"maxAdvanceDays,omitempty"`
	MaxBookingMins 			int 		`gorm:"not null;column:max_booking_mins;default:120" json:"maxBookingMins,omitempty"`
	NoShowThresholdMins int 		`gorm:"not null;column:no_show_threshold_mins;default:15" json:"noShowThresholdMins,omitempty"`
}

type Holiday struct {
	ID 				int64 			`gorm:"primaryKey;column:id" json:"id,omitempty"`
	UpdatedAt *time.Time 	`gorm:"column:updated_at;autoUpdateTime" json:"updatedAt,omitempty"`
	Date 			DateRes 		`gorm:"type:date;column:date;unique" json:"date,omitempty"`
	Name 			string 			`gorm:"type:text;column:name" json:"name,omitempty"`
	IsDayOff 	*bool 			`gorm:"column:is_day_off;default:true" json:"isDayOff,omitempty"`
	Source 		string 			`gorm:"type:text;column:source" json:"source,omitempty"`
}

type Room struct {
	ID        	uuid.UUID 				`gorm:"type:uuid;primaryKey" json:"id,omitempty"`
	CreatedAt 	*time.Time				`json:"createdAt,omitempty"`
	UpdatedAt 	*time.Time				`json:"updatedAt,omitempty"`
	DeletedAt 	*gorm.DeletedAt 	`gorm:"index" json:"deletedAt,omitempty"`
	
	Name 				string 						`gorm:"not null" json:"name,omitempty"`
	RoomNumber  uint							`gorm:"not null" json:"roomNumber,omitempty"`
	Location 		string						`json:"location,omitempty"`
	Capacity 		uint							`json:"capacity,omitempty"`
	Status 			string 						`gorm:"type:varchar(20);default:'available';check:status IN ('available', 'maintenance')" json:"status,omitempty"`
}

type User struct {
	ID 					uuid.UUID 				`gorm:"type:uuid;primaryKey" json:"id,omitempty"`
	Email 			string 						`json:"email,omitempty"`
	FullName 		string						`json:"fullName,omitempty"`
	AvatarUrl 	string						`json:"avatarUrl,omitempty"`
	Role				string						`json:"role,omitempty"`
	CreatedAt 	*time.Time				`json:"createdAt,omitempty"`
	UpdatedAt 	*time.Time				`json:"updatedAt,omitempty"`
	DeletedAt 	gorm.DeletedAt 		`gorm:"index" json:"-"`
	Status 			string 						`gorm:"type:varchar(20);default:'active';check:status IN ('active', 'inactive')" json:"status,omitempty"`
}

type Booking struct {
	ID        		uuid.UUID 			`gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id,omitempty"`
	CreatedAt 		*time.Time			`json:"-"`
	UpdatedAt 		*time.Time			`json:"-"`

	RoomID        uuid.UUID       `gorm:"type:uuid;not null" json:"-"`
	UserID        uuid.UUID       `gorm:"type:uuid;not null" json:"-"`
	// CalendarID    uuid.UUID       `gorm:"type:uuid;not null" json:"calendarId"`
	// GoogleEventID string         	`gorm:"type:text" json:"google_eventId"` // สำคัญมากสำหรับสถานะ cancelled
	
	StartTime     *time.Time      `gorm:"not null" json:"startTime,omitempty"`
	EndTime       *time.Time      `gorm:"not null" json:"endTime,omitempty"`
	Title					string					`gorm:"unique;default:no_tilte" json:"title,omitempty"`
	Passcode      *string          `gorm:"type:varchar(10);" json:"passcode,omitempty"`
	
	// สถานะ: confirm, cancelled, complete, expired
	Status        *string         `gorm:"type:varchar(20);default:'confirm';check:status IN ('confirm', 'cancelled', 'complete', 'no_show')" json:"status,omitempty"`
	CheckedInAt 	*time.Time 			`json:"checkedInAt,omitempty"`

	// Relations
	Room     			*Room     			`gorm:"foreignKey:RoomID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"Room,omitempty"`
	User     			*User     			`gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"User,omitempty"`
	// Calendar 			*Calendar 			`gorm:"foreignKey:CalendarID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"Calendar,omitempty"`
}