package main

import (
	"log"
	"context"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils"

	"github.com/joho/godotenv"
)

var ctx = context.Background()

func main() {
	if err := godotenv.Load(); err != nil {
		// log.Fatal("Can't to load env file")
		log.Println("Warning: .env file not found, hoping variables are set in environment")
	}

	db := utils.InitialDBConnection()

	googleCalendarService, err := utils.InitialCalendarService()
	if err != nil {
		log.Fatal("Can't connect to google calendar")
	}

	rdb := utils.InitialRedisConnection(ctx)
	
	handleUsecase := utils.InitialCleanArch(ctx, rdb, db, googleCalendarService)

	app := utils.InitialFiber(handleUsecase, rdb, ctx)	

	app.Listen(":8080")
}

