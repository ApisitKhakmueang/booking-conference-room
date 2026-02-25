package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	// "encoding/json"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/controller"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/gateway"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository/postgres"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository/redis"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/middleware"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/worker"
	"github.com/hibiken/asynq"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"

	// "github.com/gofiber/websocket/v2"

	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"

	"github.com/nedpals/supabase-go"
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

func InitialSupabase() *supabase.Client {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	supabaseClient := supabase.CreateClient(supabaseUrl, supabaseKey)

	return supabaseClient
}

func InitialRedisConnection(ctx context.Context) (*redis.Client, error) { // Return error เพิ่ม
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "",
		DB:       0,
	})

	// Ping เพื่อเช็ค connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err // ส่ง error กลับไปให้ main จัดการ
	}

	return rdb, nil
}

func InitialFiber(handler *http.BookingHandler, ws *Websocket.WSBookingHandler) *fiber.App {
	supabaseClient := InitialSupabase()

	app := fiber.New()
	app.Use(cors.New())

	// 2. Middleware
	app.Use(fiberLogger.New()) // Log requests

	// ETag Middleware: Fiber จะสร้าง Hash ของ Response Body อัตโนมัติ
	// ถ้า Client ส่ง If-None-Match มาตรงกัน Server จะตอบ 304 ทันที
	app.Use(etag.New(etag.Config{
		Weak: true, // ใช้ Weak ETag (W/...) เหมาะกับ JSON
	}))
	
	// For test without middleware
	api := app.Group("/api/booking")
	controller.InitialBookingRoute(api, handler)
	apiTest := app.Group("/api")
	apiTest.Get("/holiday", handler.GetHoliday)
	apiTest.Get("/room/details", handler.GetRoomDetails)

	// With middleware
	// api := app.Group("/api")
	// bookingAPI := api.Group("/booking", middleware.AuthMiddleware(supabaseClient))

	// api.Get("/holiday", handler.GetHoliday)

	wsGroup := app.Group("/ws")
	wsWithMiddleware := wsGroup.Group("/booking", middleware.WebsocketMiddleware)

	// controller.InitialBookingRoute(bookingAPI, handler)
	controller.InitialWSRoute(wsWithMiddleware, ws, supabaseClient)

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

func InitialCleanArch(rdb *redis.Client, db *gorm.DB, googleCalendarService *calendar.Service, bookingWsHub *Websocket.Hub, redisAddr string, asynqClient *asynq.Client) (*http.BookingHandler, *Websocket.WSBookingHandler) {
	postgresRepo := Postgres.NewPostgresRepository(db)
	redisRepo := Redis.NewRedisRepository(rdb, postgresRepo)
	redisPublisher := Redis.NewRedisPublisher(rdb)
	calendarService := gateway.NewGoogleCalendarGateway(googleCalendarService)
	
	bookingUsecase := usercase.NewBookingUsecase(redisRepo, redisRepo, postgresRepo, redisPublisher, calendarService, asynqClient)
	handler := http.NewBookingHandler(bookingUsecase)
	websocketHandler := Websocket.NewWSBookingHandler(bookingWsHub, bookingUsecase)
	
	worker.StartAsynqWorker(redisAddr, bookingUsecase)

	return handler, websocketHandler
}