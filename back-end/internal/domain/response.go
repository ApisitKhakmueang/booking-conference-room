package domain

import (
	"time"

	"github.com/google/uuid"
)

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

// User booking
type BookingPaginationQuery struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Status string `query:"status"` // เช่น "CONFIRMED", "COMPLETED", "ALL" (หรือปล่อยว่าง)
	Year   int    `query:"year"`   // เช่น 2026
	Month  int    `query:"month"`  // เช่น 4 (เมษายน)
}

// 📤 2. Struct ส่งออกเป็น JSON
type PaginatedBookingResponse struct {
	Data []UserBookingHistoryRes `json:"data"`
	Meta PaginationMeta          `json:"meta"`
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

// User & Statistic
type UserOverviewResponse struct {
	User       UserInfoRes  `json:"user"`
	Statistics UserStatsRes `json:"statistics"`
}

type UserInfoRes struct {
	ID        uuid.UUID `json:"id"`
	FullName  string    `json:"fullName"`
	Email     string    `json:"email"`
	AvatarUrl string    `json:"avatarUrl"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
}

type UserStatsRes struct {
	Upcoming  int64 `json:"upcoming"`
	Completed int64 `json:"completed"`
	Cancelled int64 `json:"cancelled"`
	NoShow    int64 `json:"noShow"`
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