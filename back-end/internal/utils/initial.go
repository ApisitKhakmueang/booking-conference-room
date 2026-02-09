package utils

import (
	"context"
	"fmt"
	"log"
	"time"
	"os"
	// "encoding/json"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/controller"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/gateway"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/http"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"

	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/redis/go-redis/v9"
)

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Desc  string  `json:"description"`
}

func mockDBFetch(id string) (Product, error) {
	time.Sleep(1 * time.Second) // จำลองความช้า
	if id == "1" {
		return Product{ID: "1", Name: "Gaming Mouse", Price: 1500.00, Desc: "High DPI mouse"}, nil
	}
	if id == "2" {
		return Product{ID: "2", Name: "Mechanical Keyboard", Price: 3200.00, Desc: "Blue switches"}, nil
	}
	return Product{}, fmt.Errorf("not found")
}

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

func InitialRedisConnection(ctx context.Context) *redis.Client {
	redisAddr := os.Getenv("REDIS_ADDR")
  if redisAddr == "" {
    redisAddr = "localhost:6379"
  }

	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr, 
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// ตรวจสอบการเชื่อมต่อ
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
		return nil
	}

	return rdb
}

func InitialFiber(handler *http.OrderHandler, rdb *redis.Client, ctx context.Context) *fiber.App {
	app := fiber.New()
	app.Use(cors.New())

	// 2. Middleware
	app.Use(fiberLogger.New()) // Log requests
	
	// ETag Middleware: Fiber จะสร้าง Hash ของ Response Body อัตโนมัติ
	// ถ้า Client ส่ง If-None-Match มาตรงกัน Server จะตอบ 304 ทันที
	app.Use(etag.New(etag.Config{
		Weak: true, // ใช้ Weak ETag (W/...) เหมาะกับ JSON
	}))
	// app.Get("/book", handler.GetBooks)
	// app.Get("/book/:id", handler.GetBook)
	// app.Post("/book", handler.CreateBook)
	// app.Put("/book/:id", handler.UpdateBook)
	// app.Delete("/book/:id", handler.DeleteBook)

	api := app.Group("/api")

	controller.InitialBookingRoute(api, handler)

	api.Get("/holiday", handler.GetHoliday)

	// app.Get("/api/product/:id", handler.TestRedis)

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

func InitialCleanArch(ctx context.Context, rdb *redis.Client, db *gorm.DB, googleCalendarService *calendar.Service) (*http.OrderHandler) {
	// redisRepo := repository.NewredisRepo(ctx, rdb)
	calendarService := gateway.NewGoogleCalendarGateway(googleCalendarService)
	bookingRepo := repository.NewPostgresBookingRepo(ctx, rdb, db)
	orderUsecase := usercase.NewOrderUsecase(bookingRepo, calendarService)
	handleUsecase := http.NewOrderHandler(orderUsecase)

	return handleUsecase
}