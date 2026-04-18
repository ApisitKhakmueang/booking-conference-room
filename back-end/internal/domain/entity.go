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

// Response
type WebSocketPayload struct {
	Type string 						`json:"type"`
	Data struct {
		RoomID 			uuid.UUID `json:"room_id"`
		RoomNumber 	uint 			`json:"room_number"`
		UserID     	string 		`json:"user_id"`
		Status			bool			`json:"status"`
	} 											`json:"data"`
}

type WSMessage struct {
	Type  string      `json:"type"`  // "auth" หรือ "chat" หรือ "command"
	Token string      `json:"token,omitempty"` // ใช้ตอน auth
	Data  interface{} `json:"data,omitempty"`  // ข้อมูลจริงๆ
}

// Static
// 🌟 1. Struct หลักที่รวมทุกอย่างเข้าด้วยกัน (ตัวนี้คือตัวที่เราจะ return กลับไปให้ Frontend)
type UserDetailResponse struct {
	User           UserInfoRes             `json:"user"`
	Statistics     UserStatsRes            `json:"statistics"`
	BookingHistory []UserBookingHistoryRes `json:"bookingHistory"`
}

// 🌟 2. Struct สำหรับข้อมูล User พื้นฐาน (คัดมาเฉพาะที่ใช้)
type UserInfoRes struct {
	ID        uuid.UUID `json:"id"`
	FullName  string    `json:"fullName"`
	Email     string    `json:"email"`
	AvatarUrl string    `json:"avatarUrl"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
}

// 🌟 3. Struct สำหรับเก็บสถิติ
type UserStatsRes struct {
	TotalBookings int `json:"totalBookings"`
	Completed     int `json:"completed"`
	Cancelled     int `json:"cancelled"`
	NoShow        int `json:"noShow"`
}

// 🌟 4. Struct สำหรับตารางประวัติการจอง
type UserBookingHistoryRes struct {
	ID          uuid.UUID   `json:"id"`
	Title       string      `json:"title"`
	StartTime   *time.Time  `json:"startTime"`
	EndTime     *time.Time  `json:"endTime"`
	Status      *string     `json:"status"`
	CheckedInAt *time.Time  `json:"checkedInAt"`
	Room        UserRoomRes `json:"Room"` // ใช้ตัวพิมพ์ใหญ่ตาม JSON แบบเดิม
}

// 🌟 5. Struct สำหรับข้อมูลห้องย่อยๆ ที่อยู่ในการจอง
type UserRoomRes struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	RoomNumber uint      `json:"roomNumber"`
	Location   string    `json:"location"`
}

// User management 
// เอาไว้รับ Query จาก URL
type UserPaginationQuery struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
}

// เอาไว้ส่งกลับไปให้ Frontend
type PaginatedUserResponse struct {
	Data []User `json:"data"`
	Meta PaginationMeta `json:"meta"`
}

type PaginationMeta struct {
	TotalItems       int64 `json:"totalItems"`
	ItemsPerPage     int   `json:"itemsPerPage"`
	TotalPages       int   `json:"totalPages"`
	CurrentPage      int   `json:"currentPage"`
	IndexOfFirstItem int   `json:"indexOfFirstItem"` // ⭐️ เพิ่มเข้ามา
	IndexOfLastItem  int   `json:"indexOfLastItem"`  // ⭐️ เพิ่มเข้ามา
}

// Query & group data
type GetBookingFilter struct {
	Duration   	string 	`query:"duration"` // จาก URL Query
	Room   			uint    `query:"room"`      // จาก URL Query
}

type CreateEvent struct {
	GoogleCalendarID 	string
	Title 					string
	Email 						string
}

type Date struct {
	StartStr 	string		`params:"startDate"`
	EndStr 		string		`params:"endDate"`
}

type AttendanceHealth struct {
	Completed 			int 	`json:"completed"`
	Cancelled 			int 	`json:"cancelled"`
	NoShow 					int 	`json:"noShow"`
	CompletionRate 	int 	`json:"completionRate"`
	CanCelledRate 	int 	`json:"cancelledRate"`
	NoShowRate 			int 	`json:"noShowRate"`
}

type PopularRoom struct {
	ID 					uuid.UUID 		`json:"id"`
	RoomNumber  uint 					`json:"roomNumber"`
	Name 				string 				`json:"name"`
	Percentage 	int 					`json:"percentage"`
}

type UpNextBookingResponse struct {
	AttendanceHealth  AttendanceHealth 		`json:"attendanceHealth"`
	PopularRooms      []PopularRoom     	`json:"popularRooms"`
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