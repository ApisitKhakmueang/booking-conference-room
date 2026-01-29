package main

import (
	"log"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Cann't to load env file")
	}

	db := utils.InitialDBConnection()

	googleCalendarService, err := utils.InitialCalendarService()
	if err != nil {
		log.Fatal("Can't connect to google calendar")
	}

	handleUsecase := utils.InitialCleanArch(db, googleCalendarService)

	app := utils.InitialFiber(handleUsecase)
	app.Listen(":8080")
}

