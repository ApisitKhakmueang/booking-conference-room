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
func (p *BookingProcessor) HandleBookingExpiredTask(ctx context.Context, t *asynq.Task) error {
	// 1. แกะกล่องข้อมูล
	var payload BookingStatusPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err // ถ้า Error, Asynq จะเก็บคิวไว้ลองทำใหม่ (Retry) ให้อัตโนมัติ!
	}

	log.Println("GetBookingByID from HandleBookingExpired")
	currentBooking, err := p.usecase.GetBookingByID(ctx, payload.BookingID)
	if err != nil {
		// ✅ เพิ่มการดัก ErrorNotFound
		if errors.Is(err, customError.ErrorNotFound) {
			return nil 
		}
		return err
	}

	if *currentBooking.Status != "confirm" {
		log.Printf("Booking %s is already %s. Skipping task.", payload.BookingID, *currentBooking.Status)
		return nil // ข้ามไปเลย ถือว่าจบงาน
	}

	if time.Now().Before(*currentBooking.EndTime) {
		log.Printf("Booking %s was extended to %v.", payload.BookingID, currentBooking.EndTime)
		return nil // ข้ามไปเลย เดี๋ยวมี Task 15:00 ตื่นมาทำเอง
	}

	// 2. สั่ง DB ให้อัปเดตสถานะ (เช่น UPDATE bookings SET status = 'completed' WHERE id = ?)
	if currentBooking.CheckedInAt == nil {
		log.Printf("Booking %s expired but never checked in. Marking as no-show.", payload.BookingID)
		err = p.usecase.UpdateBookingNoshowStatus(ctx, payload.BookingID) // เปลี่ยนไปเรียกท่า No-show แทน
	} else {
		err = p.usecase.UpdateBookingEndStatus(ctx, payload.BookingID) // ใช้งานจริง เรียกท่า End (complete)
	}

	return nil // Return nil แปลว่างานสำเร็จ Asynq จะลบงานนี้ออกจาก Redis ให้เลย
}

func (p *BookingProcessor) HandleBookingStartTask(ctx context.Context, t *asynq.Task) error {
	// 1. แกะกล่องข้อมูล
	var payload BookingStatusPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err // ถ้า Error, Asynq จะเก็บคิวไว้ลองทำใหม่ (Retry) ให้อัตโนมัติ!
	}

	log.Println("GetBookingByID from HandleBookingStartTask")
	currentBooking, err := p.usecase.GetBookingByID(ctx, payload.BookingID)
	if err != nil {
		if errors.Is(err, customError.ErrorNotFound) {
			return nil // โดนลบไปแล้ว ไม่ต้องทำอะไร
		}
		return err
	}

	if *currentBooking.Status != "confirm" {
		log.Printf("Booking %s is cancelled. Skipping start task.", payload.BookingID)
		return nil
	}

	if time.Now().Before(*currentBooking.StartTime) {
		log.Printf("Booking %s start time was delayed to %v. Skipping this old task.", payload.BookingID, currentBooking.StartTime)
		return nil 
	}

	// 2. สั่ง DB ให้อัปเดตสถานะ (เช่น UPDATE bookings SET status = 'completed' WHERE id = ?)
	p.usecase.PublishStatus("booking_start", currentBooking)
	p.usecase.PublishRoomStatus("booking_start", currentBooking)

	return nil // Return nil แปลว่างานสำเร็จ Asynq จะลบงานนี้ออกจาก Redis ให้เลย
}

// ตอน Asynq หยิบงาน No-show มาทำ
func (p *BookingProcessor) HandleBookingNoShowTask(ctx context.Context, t *asynq.Task) error {
	var payload BookingStatusPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err // ถ้า Error, Asynq จะเก็บคิวไว้ลองทำใหม่ (Retry) ให้อัตโนมัติ!
	}

	// 1. ไปดึงข้อมูลล่าสุดจาก Database
	currentBooking, err := p.usecase.GetBookingByID(ctx, payload.BookingID)
	if err != nil {
		if errors.Is(err, customError.ErrorNotFound) {
			return nil // โดนลบไปแล้ว ไม่ต้องทำอะไร
		}
		return err
	}

	realNoShowTime := (*currentBooking.StartTime).Add(15 * time.Minute)
	if time.Now().Before(realNoShowTime) {
		log.Printf("Booking %s was rescheduled. Real no-show time is %v. Skipping this old task.", payload.BookingID, realNoShowTime)
		return nil
	}

	// เช็คว่า "เขาเช็คอินไปแล้วหรือยัง?" หรือ "เขากดยกเลิกไปเองแล้วหรือเปล่า?"
	if currentBooking.CheckedInAt != nil || *currentBooking.Status != "confirm" {
		log.Printf("Booking %s is already active or cancelled. Skipping No-Show logic.", currentBooking.ID)
		return nil 
	}

	// 3. ถ้าถึงตรงนี้แปลว่าเลย 15 นาทีแล้ว และ checked_in_at ยังเป็น nil
	// สั่ง ยกเลิกการจอง -> อัปเดต DB -> ลบ Redis Cache -> Broadcast WebSockets
	err = p.usecase.UpdateBookingNoshowStatus(ctx, currentBooking.ID)
	
	return err
}