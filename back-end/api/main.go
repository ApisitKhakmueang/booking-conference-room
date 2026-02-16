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

	"github.com/joho/godotenv"
)

var ctx = context.Background()

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := godotenv.Load(); err != nil {
		// log.Fatal("Can't to load env file")
		log.Println("Warning: .env file not found, hoping variables are set in environment")
	}

	db := utils.InitialDBConnection()

	googleCalendarService, err := utils.InitialCalendarService()
	if err != nil {
		log.Fatal("Can't connect to google calendar")
	}

	rdb, err := utils.InitialRedisConnection(ctx)
	if err != nil {
		log.Fatalf("Can't connect to Redis: %v", err)
	}
	defer rdb.Close() // ปิด Redis เมื่อจบโปรแกรม

	wsHub := Websocket.NewHub(rdb)
	
	go wsHub.Run(ctx)

	handleUsecase, websocketHandler := utils.InitialCleanArch(
		rdb, 
		db, 
		googleCalendarService, 
		wsHub,
	)

	app := utils.InitialFiber(handleUsecase, websocketHandler)	

	go func() {
		if err := app.Listen(":8080"); err != nil {
			log.Printf("Server Error: %v", err)
		}
	}()

	log.Println("Server is running on :8080")

	// 8. Wait for Interrupt Signal (รอจนกว่าจะมีการกด Ctrl+C)
	<-ctx.Done()
	log.Println("Shutting down server...")
}

