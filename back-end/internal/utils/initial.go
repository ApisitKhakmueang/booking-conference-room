package utils

import (
	"context"
	"fmt"
	"log"
	"time"
	"os"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/controller"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/gateway"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/http"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)


func InitialDBConnection() *gorm.DB {
	// ใช้ Connection String จากหน้าเมนู Settings > Database ใน Supabase
	dsn := os.Getenv("DATABASE_URL")
	
	newLogger := logger.New(
    log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
    logger.Config{
      SlowThreshold: time.Second, // Slow SQL threshold
      LogLevel:      logger.Info, // Log level
      Colorful:      true,        // Enable color
    },
  )
	
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
		PreferSimpleProtocol: true, // บังคับใช้ Simple Protocol (เหมาะสำหรับ Supabase/PgBouncer)
	}), &gorm.Config{
		PrepareStmt: false, // ปิด Caching ในระดับ GORM
		Logger: newLogger,
	})
	
	if err != nil {
		log.Panic("failed to connect database")
	}

	fmt.Println("Coneect DB successfully")

	return db
}

func InitialFiber(handler *http.OrderHandler) *fiber.App {
	app := fiber.New()

	// app.Get("/book", handler.GetBooks)
	// app.Get("/book/:id", handler.GetBook)
	// app.Post("/book", handler.CreateBook)
	// app.Put("/book/:id", handler.UpdateBook)
	// app.Delete("/book/:id", handler.DeleteBook)

	api := app.Group("/api")

	controller.InitialBookingRoute(api, handler)

	// app.Get("/test/calendar", handler.GetCalendar)

	return app
}

func InitialCalendarService() (*calendar.Service, error) {
	jsonCreds := os.Getenv("GOOGLE_CREDENTIALS_JSON")
	if jsonCreds == "" {
			return nil, fmt.Errorf("GOOGLE_CREDENTIALS_JSON is missing")
	}

	ctx := context.Background()
	return calendar.NewService(ctx, option.WithCredentialsJSON([]byte(jsonCreds)))
}

func InitialCleanArch(db *gorm.DB, googleCalendarService *calendar.Service) (*http.OrderHandler) {
	calendarService := gateway.NewGoogleCalendarGateway(googleCalendarService)
	bookingRepo := repository.NewPostgresBookingRepo(db)
	orderUsecase := usercase.NewOrderUsecase(bookingRepo, calendarService)
	handleUsecase := http.NewOrderHandler(orderUsecase)

	return handleUsecase
}