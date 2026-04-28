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
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository/gateway"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository/postgres"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/repository/redis"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/middleware"
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

func InitDatabase(db *gorm.DB) error {
    
    // นำ Struct ทุกตัวที่ต้องการสร้างตารางใส่เข้าไปใน AutoMigrate
    err := db.AutoMigrate(
        &domain.Config{},
        &domain.Holiday{},
        &domain.Room{},
        &domain.User{},
        &domain.Booking{}, // Booking มี Foreign Key ไปหา Room และ User ควรไว้หลังสุด
    )
    
    if err != nil {
        return fmt.Errorf("failed to auto migrate database: %w", err)
    }
    
    return nil
}

func InitialSupabase() *supabase.Client {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	supabaseClient := supabase.CreateClient(supabaseUrl, supabaseKey)

	return supabaseClient
}

func InitialRedisConnection(ctx context.Context, redisURL string) (*redis.Client, error) {
	// 1. ดึงค่าจาก Environment Variable (ตอน Deploy บน Koyeb เราจะตั้งชื่อนี้)
	if redisURL == "" {
		// เผื่อไว้ใช้ตอนเทสในเครื่องตัวเอง
		redisURL = "redis://localhost:6379" 
	}

	// 2. ใช้ ParseURL เพราะมันจะจัดการทั้ง Host, Password และ TLS (SSL) ให้โดยอัตโนมัติ
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}

	rdb := redis.NewClient(opt)

	// 3. Ping เพื่อเช็ค connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return rdb, nil
}

func InitialFiber(usecase *domain.AllUsecase, bookingWsHub *Websocket.Hub) *fiber.App {
	// HTTP Handler
	bookingHandler := http.NewBookingHandlers(usecase.BookingUsecases)
	configHandler := http.NewConfigHandler(usecase.ConfigUsecase)
	roomHandler := http.NewRoomHandler(usecase.RoomUsecase)
	userHandler := http.NewUserHandler(usecase.UserUsecase)

	// Websocker Hanlder
	bookingWebsocket := Websocket.NewWSBookingHandler(bookingWsHub, usecase.BookingUsecases)

	supabaseClient := InitialSupabase()

	app := fiber.New()
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
			// ถ้าไม่มี Env ให้ใช้ localhost เป็นค่าเริ่มต้น
			frontendURL = "http://localhost:3000"
	} else {
			// ถ้ามี Env (เช่น URL ของ Vercel) ให้เพิ่ม localhost เข้าไปเผื่อไว้ด้วย
			// ใช้เครื่องหมาย , คั่น
			frontendURL = fmt.Sprintf("%s, http://localhost:3000", frontendURL)
	}

	// 2. ตั้งค่า CORS แบบเจาะจง
	app.Use(cors.New(cors.Config{
		AllowOrigins:     frontendURL, // อนุญาตเฉพาะเว็บ Vercel ของเรา (หรือ localhost)
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH",
		AllowCredentials: true, // สำคัญมาก! ถ้าต้องมีการส่ง Cookie หรือ Token Auth
	}))

	// 2. Middleware
	app.Use(fiberLogger.New()) // Log requests

	// ETag Middleware: Fiber จะสร้าง Hash ของ Response Body อัตโนมัติ
	// ถ้า Client ส่ง If-None-Match มาตรงกัน Server จะตอบ 304 ทันที
	app.Use(etag.New(etag.Config{
		Weak: true, // ใช้ Weak ETag (W/...) เหมาะกับ JSON
	}))

	// HTTP API
	api := app.Group("/api/v1")
	admin := api.Group("/admin", middleware.AuthMiddleware())
	bookingAPI := api.Group("/booking", middleware.AuthMiddleware())
	roomAPI := admin.Group("/room", middleware.AuthMiddleware())
	controller.InitialBookingRoute(bookingAPI, bookingHandler)
	controller.InitialRoomRoute(roomAPI, roomHandler)
	controller.InitialHelperRoute(api, bookingHandler, roomHandler, configHandler) // Route ที่ไม่ต้องการ Auth
	controller.InitialAdminRoute(admin, userHandler, configHandler)
	
	wsGroup := app.Group("/ws")
	wsWithMiddleware := wsGroup.Group("/booking", middleware.WebsocketMiddleware)
	controller.InitialWSRoute(wsWithMiddleware, bookingWebsocket, supabaseClient)

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

func InitialCleanArch(rdb *redis.Client, db *gorm.DB, googleCalendarService *calendar.Service, bookingWsHub *Websocket.Hub, redisAddr string, asynqClient *asynq.Client) *domain.AllUsecase {
	// Postgres Repositorys
	bookingPostgres := postgresRepo.NewBookingPostgresRepo(db)
	configPostgres := postgresRepo.NewConfigPostgresRepo(db)
	roomPostgres := postgresRepo.NewRoomPostgresRepo(db)
	userPostgres := postgresRepo.NewUserPostgresRepo(db)
	workerPostgres := postgresRepo.NewWorkerPostgresRepo(db)

	// Redis Repositorys
	bookingRedis := redisRepo.NewBookingRedisRepo(rdb)
	configRedis := redisRepo.NewConfigRedisRepo(rdb)
	roomRedis := redisRepo.NewRoomRedisRepo(rdb)
	workerRedis := redisRepo.NewWorkerRedisRepo(rdb)

	// Publishers
	bookingPublisher := redisRepo.NewRedisPublisher(rdb)
	workerPublisher := redisRepo.NewRedisPublisher(rdb)
	configPublisher := redisRepo.NewRedisPublisher(rdb)
	roomPublisher := redisRepo.NewRedisPublisher(rdb)

	// Gateway
	configGateway := gateway.NewGoogleCalendarGateway(googleCalendarService)

	// Usecases
	bookingUsecases := usecase.NewBookingUsecases(bookingPublisher, bookingRedis, bookingPostgres, asynqClient)
	configUsecase := usecase.NewConfigUsecase(configPublisher, configRedis, configPostgres, configGateway)
	roomUsecase := usecase.NewRoomUsecase(roomPublisher, roomRedis, roomPostgres)
	userUsecase := usecase.NewUserUsecase(userPostgres)
	workerUsecase := usecase.NewWorkerUsecase(workerPublisher, workerRedis, workerPostgres)

	return &domain.AllUsecase{
		BookingUsecases: bookingUsecases,
		ConfigUsecase: configUsecase,
		RoomUsecase: roomUsecase,
		UserUsecase: userUsecase,
		WorkerUsecase: workerUsecase,
	}
}