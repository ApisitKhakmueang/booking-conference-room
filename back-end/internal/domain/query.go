package domain

import "github.com/google/uuid"

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