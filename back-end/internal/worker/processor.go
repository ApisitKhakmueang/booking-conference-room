package worker

import (
	"context"
	"encoding/json"
	"errors"
	"log"

	// "log"

	customError "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/customErrors"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/hibiken/asynq"
)

// สร้าง Struct เพื่อรับ Usecase หรือ Repo เข้ามาใช้งาน
type BookingProcessor struct {
	usecase domain.BookingUsecase // หรือจะเป็น Repo ก็ได้ตามสถาปัตยกรรมของคุณ
}

func NewBookingProcessor(uc domain.BookingUsecase) *BookingProcessor {
	return &BookingProcessor{usecase: uc}
}

// ฟังก์ชันนี้จะถูก Asynq เรียกอัตโนมัติ เมื่อถึงเวลา EndTime ที่เราตั้งไว้!!
func (p *BookingProcessor) HandleBookingExpired(ctx context.Context, t *asynq.Task) error {
	// 1. แกะกล่องข้อมูล
	var payload BookingExpiredPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err // ถ้า Error, Asynq จะเก็บคิวไว้ลองทำใหม่ (Retry) ให้อัตโนมัติ!
	}

	// log.Printf("⏰ Time's up! Expiring booking ID: %s for Room: %d", payload.BookingID, payload.RoomNumber)

	// 2. สั่ง DB ให้อัปเดตสถานะ (เช่น UPDATE bookings SET status = 'completed' WHERE id = ?)
	err := p.usecase.UpdateBookingStatus(ctx, payload.BookingID)
	if err != nil && !errors.Is(err, customError.ErrorNotFound) {
		log.Println("Custom error occur")
		return nil // สั่ง Retry ถ้า DB มีปัญหาชั่วคราว
	}

	return nil // Return nil แปลว่างานสำเร็จ Asynq จะลบงานนี้ออกจาก Redis ให้เลย
}