package worker // หรือ package main ถ้าคุณวางไว้ในไฟล์เดียวกับ main

import (
	"log"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/hibiken/asynq"
	// import usecase ของคุณ
)

// ========================================================
// 1. ฟังก์ชันสร้าง Client (คนสั่งงาน)
// ========================================================
func NewAsynqClient(redisAddr string) *asynq.Client {
	redisOpt := asynq.RedisClientOpt{Addr: redisAddr}
	return asynq.NewClient(redisOpt)
}

// ========================================================
// 2. ฟังก์ชันสตาร์ท Server (คนรับงานไปทำ)
// ========================================================
// สังเกตว่าเรารับ bookingUC เข้ามาด้วย เพื่อเอามาผูกกับ Processor
func StartAsynqWorker(redisAddr string, bookingUC domain.BookingUsecase) {
	redisOpt := asynq.RedisClientOpt{Addr: redisAddr}

	asynqServer := asynq.NewServer(
		redisOpt,
		asynq.Config{
			Concurrency: 10, // รันพร้อมกัน 10 งาน
			// สามารถเพิ่มตั้งค่าอื่นๆ เช่น Logger, Error Handler ได้ที่นี่
		},
	)

	mux := asynq.NewServeMux()
	
	// สร้าง Processor และผูกชื่องาน
	processor := NewBookingProcessor(bookingUC)
	mux.HandleFunc(TypeBookingExpired, processor.HandleBookingExpired)

	// สตาร์ทแบบ Goroutine
	go func() {
		log.Println("🚀 Asynq Worker Server is running...")
		if err := asynqServer.Run(mux); err != nil {
			log.Fatalf("❌ Could not run Asynq server: %v", err)
		}
	}()
}