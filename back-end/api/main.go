package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	_ "time/tzdata" // 🔥 เพิ่มบรรทัดนี้ (ขีดล่าง _ สำคัญมาก)

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/worker"

	"github.com/joho/godotenv"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := godotenv.Load(); err != nil {
		// log.Fatal("Can't to load env file")
		log.Println("Warning: .env file not found, hoping variables are set in environment")
	}
	redisAddr := os.Getenv("REDIS_URL")

	db := utils.InitialDBConnection()

	googleCalendarService, err := utils.InitialCalendarService()
	if err != nil {
		log.Fatal("Can't connect to google calendar")
	}


	rdb, err := utils.InitialRedisConnection(ctx, redisAddr)
	if err != nil {
		log.Fatalf("Can't connect to Redis: %v", err)
	}
	defer rdb.Close() // ปิด Redis เมื่อจบโปรแกรม

	bookingWsHub := Websocket.NewHub(rdb, "bookings_realtime")
	go bookingWsHub.Run(ctx)

	// 1. สร้าง Asynq Client (ต้องสั่ง defer Close ไว้ที่ main เพื่อปิดคอนเนคชันตอนแอปดับ)
	asynqClient := worker.NewAsynqClient(redisAddr)
	defer asynqClient.Close()

	handleUsecase, websocketHandler := utils.InitialCleanArch(
		rdb, 
		db, 
		googleCalendarService, 
		bookingWsHub,
		redisAddr,
		asynqClient,
	)

	app := utils.InitialFiber(handleUsecase, websocketHandler)	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" 
	}

	// 3. สั่งรัน Server ด้วยพอร์ตนั้น (สังเกตว่าต้องมี ":" นำหน้า)
	serverAddr := ":" + port

	go func() {
		if err := app.Listen(serverAddr); err != nil {
			log.Printf("Server Error: %v", err)
		}
	}()

	log.Println("Server is running on " + serverAddr)

	// 8. Wait for Interrupt Signal (รอจนกว่าจะมีการกด Ctrl+C)
	<-ctx.Done()
	log.Println("Shutting down server...")
}

