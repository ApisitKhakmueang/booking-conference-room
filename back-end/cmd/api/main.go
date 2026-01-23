package main

import (
	"fmt"
	"log"
	"os"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"

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

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Cann't to load env file")
	}

	app := fiber.New()

	db := initialDBConnection()

	orderRepo := repository.NewPostgresOrderRepo(db)
	orderUsecase := usercase.NewOrderUsecase(orderRepo)
	handleUsecase := http.NewOrderHandler(orderUsecase)

	app.Get("/book", handleUsecase.GetBooks)
	app.Get("/book/:id", handleUsecase.GetBook)
	app.Post("/book", handleUsecase.CreateBook)
	app.Put("/book/:id", handleUsecase.UpdateBook)
	app.Delete("/book/:id", handleUsecase.DeleteBook)

	app.Listen(":8080")
}

