package worker

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

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

	currentBooking, err := p.usecase.GetBookingByID(ctx, payload.BookingID)
	if err != nil {
		return err
	}

	if currentBooking.Status == "cancelled" || currentBooking.Status != "confirm" {
		log.Printf("Booking %s is already %s. Skipping task.", payload.BookingID, currentBooking.Status)
		return nil // ข้ามไปเลย ถือว่าจบงาน
	}

	if time.Now().Before(*currentBooking.EndTime) {
		log.Printf("Booking %s was extended to %v. Skipping this old 14:00 task.", payload.BookingID, currentBooking.EndTime)
		return nil // ข้ามไปเลย เดี๋ยวมี Task 15:00 ตื่นมาทำเอง
	}

	// 2. สั่ง DB ให้อัปเดตสถานะ (เช่น UPDATE bookings SET status = 'completed' WHERE id = ?)
	err = p.usecase.UpdateBookingStatus(ctx, payload.BookingID)
	if err != nil && !errors.Is(err, customError.ErrorNotFound) {
		log.Println("Custom error occur")
		return nil // สั่ง Retry ถ้า DB มีปัญหาชั่วคราว
	}

	return nil // Return nil แปลว่างานสำเร็จ Asynq จะลบงานนี้ออกจาก Redis ให้เลย
}