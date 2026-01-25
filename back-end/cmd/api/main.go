package main

import (
	"fmt"
	"log"
	"os"
	"context"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/gateway"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"

	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func initialDBConnection() *gorm.DB {
	// ใช้ Connection String จากหน้าเมนู Settings > Database ใน Supabase
	dsn := os.Getenv("DATABASE_URL")

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
		PreferSimpleProtocol: true, // บังคับใช้ Simple Protocol (เหมาะสำหรับ Supabase/PgBouncer)
	}), &gorm.Config{
		PrepareStmt: false, // ปิด Caching ในระดับ GORM
	})
	
	if err != nil {
		log.Panic("failed to connect database")
	}

	fmt.Println("Coneect DB successfully")

	return db
}

func initialFiber(handler *http.OrderHandler) *fiber.App {
	app := fiber.New()

	app.Get("/book", handler.GetBooks)
	app.Get("/book/:id", handler.GetBook)
	app.Post("/book", handler.CreateBook)
	app.Put("/book/:id", handler.UpdateBook)
	app.Delete("/book/:id", handler.DeleteBook)

	return app
}

func initialCalendarService() (*calendar.Service, error) {
	jsonCreds := os.Getenv("GOOGLE_CREDENTIALS_JSON")
	if jsonCreds == "" {
			return nil, fmt.Errorf("GOOGLE_CREDENTIALS_JSON is missing")
	}

	ctx := context.Background()
	return calendar.NewService(ctx, option.WithCredentialsJSON([]byte(jsonCreds)))
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Cann't to load env file")
	}

	db := initialDBConnection()

	googleCalendarService, err := initialCalendarService()
	if err != nil {
		log.Fatal("Can't connect to google calendar")
	}

	calendarService := gateway.NewGoogleCalendarGateway(googleCalendarService)
	bookingRepo := repository.NewPostgresBookingRepo(db)
	orderUsecase := usercase.NewOrderUsecase(bookingRepo, calendarService)
	handleUsecase := http.NewOrderHandler(orderUsecase)

	app := initialFiber(handleUsecase)
	app.Listen(":8080")
}

