package worker

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

// 1. ตั้งชื่องาน
const TypeBookingExpired = "booking:expired"
const TypeBookingStart = "booking:start"
// Create booking start

// 2. ข้อมูลที่ต้องฝากไว้ในคิว (เก็บแค่ ID ก็พอ เพราะถึงเวลาเราจะไปดึงของสดใหม่จาก DB)
type BookingStatusPayload struct {
	BookingID  	uuid.UUID 		`json:"booking_id"`
	RoomNumber 	uint   			`json:"room_number"`
}	

// 3. ฟังก์ชันสร้างกล่องงาน (Task)
func NewBookingExpiredTask(bookingID uuid.UUID) (*asynq.Task, error) {
	payload, err := json.Marshal(BookingStatusPayload{
		BookingID:  bookingID,
		// RoomNumber: roomNumber,
	})
	if err != nil {
		return nil, err
	}
	
	// สร้าง Task พร้อมแนบ Payload
	return asynq.NewTask(TypeBookingExpired, payload), nil
}

// New booking start task
func NewBookingStartTask(bookingID uuid.UUID) (*asynq.Task, error) {
	payload, err := json.Marshal(BookingStatusPayload{
		BookingID:  bookingID,
		// RoomNumber: roomNumber,
	})
	if err != nil {
		return nil, err
	}
	
	// สร้าง Task พร้อมแนบ Payload
	return asynq.NewTask(TypeBookingStart, payload), nil
}