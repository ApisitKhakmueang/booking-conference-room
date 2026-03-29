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
func NewAsynqClient(redisAddrURL string) *asynq.Client {
	asynqRedisOpt, err := asynq.ParseRedisURI(redisAddrURL)
	if err != nil {
		log.Fatal(err)
	}

	// และนำไปใส่ตอนสร้าง Client ด้วย
	client := asynq.NewClient(asynqRedisOpt)
	return client
}

// ========================================================
// 2. ฟังก์ชันสตาร์ท Server (คนรับงานไปทำ)
// ========================================================
// สังเกตว่าเรารับ bookingUC เข้ามาด้วย เพื่อเอามาผูกกับ Processor
func StartAsynqWorker(redisAddrURL string, bookingUC domain.BookingUsecase) {
	redisOpt, err := asynq.ParseRedisURI(redisAddrURL)
	if err != nil {
		log.Fatalf("❌ Failed to parse Redis URI for Asynq Worker: %v", err)
	}

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
	mux.HandleFunc(TypeBookingStart, processor.HandleBookingStart)
	// Add new handler booking start

	// สตาร์ทแบบ Goroutine
	go func() {
		// log.Println("🚀 Asynq Worker Server is running...")
		if err := asynqServer.Run(mux); err != nil {
			log.Fatalf("❌ Could not run Asynq server: %v", err)
		}
	}()
}