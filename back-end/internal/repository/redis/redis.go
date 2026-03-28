package Redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain/repository/postgres"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type redisRepository struct {
	rdb 			*redis.Client
	postgres	postgresRepo.PostgresRepository
}

func NewRedisRepository(rdb *redis.Client, postgres postgresRepo.PostgresRepository) *redisRepository {
	return &redisRepository{
		rdb: rdb,
		postgres: postgres,
	}
}

func (r *redisRepository) CreateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	if err := r.postgres.CreateBookingDB(ctx, booking); err != nil {
		return err
	}

	r.DeleteBookingToCache(ctx, roomNumber)
	r.DeleteUserToCache(ctx, booking.UserID)

	return nil
}

func (r *redisRepository) UpdateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	prevRoomNumber, err := r.postgres.GetRoomNumber(ctx, booking.ID)
	if err != nil {
		return err
	}

	if err := r.postgres.UpdateBookingDB(ctx, booking); err != nil {
		return err
	}

	// 1. เคลียร์ Cache ของห้องเก่า (ถ้าห้องเปลี่ยน มันจะลบห้องเก่าให้)
	r.DeleteBookingToCache(ctx, prevRoomNumber)

	// 2. เคลียร์ Cache ของห้องใหม่ (ถ้าห้องไม่เปลี่ยน มันก็แค่สั่งลบ Prefix เดิมซ้ำ ซึ่งไม่ Error ปลอดภัยครับ)
	if prevRoomNumber != roomNumber { // สมมติว่าใน booking มี RoomID ให้เช็ค
		// หรือถ้า Usecase ส่ง roomNumber ใหม่เข้ามา ก็ใช้ตัวนั้นแทนได้เลย
		r.DeleteBookingToCache(ctx, roomNumber)
	}

	r.DeleteUserToCache(ctx, booking.UserID)

	return nil
}

func (r *redisRepository) DeleteBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error) {
	deletedBooking, err := r.postgres.DeleteBookingDB(ctx, booking.ID);
	if err != nil {
		return nil, err
	}

	r.DeleteBookingToCache(ctx, roomNumber)
	r.DeleteUserToCache(ctx, booking.UserID)
	
	return deletedBooking, nil
}

func (r *redisRepository) GetBooking(ctx context.Context,dateTime *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, dateTime.StartStr, dateTime.EndStr)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []domain.Booking
		if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
			return nil, err
		}

		return bookings, nil
	}

	bookings, err := r.postgres.GetBookingDB(ctx, dateTime, roomID)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (r *redisRepository) GetUserBooking(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:user:%s:date:%s", userID, date)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []domain.Booking
		if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
			return nil, err
		}

		return bookings, nil
	}

	bookings, err := r.postgres.GetUserBookingDB(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (r *redisRepository) GetBookingStatus(ctx context.Context, timeStart string) ([]domain.Booking, error) {
	bookings, err := r.postgres.GetBookingStatusDB(ctx)
	if err != nil {
		return nil, err
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return bookings, nil
}

func (r *redisRepository) GetRoomDetails(ctx context.Context) ([]domain.Room, error) {
	cacheKey := "room:details"

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var rooms []domain.Room
		if err := json.Unmarshal([]byte(vals), &rooms); err != nil {
			return nil, err
		}

		return rooms, nil
	}

	rooms, err := r.postgres.GetRoomDetailsDB(ctx)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(rooms); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return rooms, nil
}

func (r *redisRepository) GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	var holidays []domain.Holiday
	val, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(val), &holidays); err == nil {
			return holidays, nil
		}
	}

	holidays, err = r.postgres.GetHolidayDB(ctx, date)

	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(holidays); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return holidays, nil
}

func (r *redisRepository) UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error) {
	roomNumber, err := r.postgres.GetRoomNumber(ctx, bookingID)
	if err != nil {
		return nil, 0, err
	}

	updateBooking, err := r.postgres.UpdateBookingStatusDB(ctx, bookingID, "complete")
	if err != nil {
		return nil, 0, err
	}

	r.DeleteBookingToCache(ctx, roomNumber)
	r.DeleteUserToCache(ctx, updateBooking.UserID)

	return updateBooking, roomNumber, nil
}

// HelperRedisRepository methods
func (r *redisRepository) FindHolidaySynced(ctx context.Context, date *domain.Date) int64 {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)

	exists, _ := r.rdb.Exists(ctx, key).Result()
	return exists
}

func (r *redisRepository) SetHolidaySynced(ctx context.Context, date *domain.Date) error {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)
	// ตั้ง TTL ตามความเหมาะสม เช่น 1 วัน หรือ 7 วัน (ถ้า Google Calendar ไม่ได้แก้บ่อย)
	// ข้อมูลใน DB จะถือว่า "สดใหม่" เท่ากับระยะเวลา TTL นี้
	return r.rdb.Set(ctx, key, "1", 7*24*time.Hour).Err()
}

func (r *redisRepository) DeleteHolidayCache(ctx context.Context, date *domain.Date) error {
	// 1. สร้าง Key ให้เหมือนกับตอน Get เป๊ะๆ
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	// 2. สั่งลบ (Del)
	if err := r.rdb.Del(ctx, cacheKey).Err(); err != nil {
		return err // หรือจะแค่ log ก็ได้ ถ้าซีเรียส
	}
	return nil
}

// Internal function
func (r *redisRepository) ClearCacheByPrefix(ctx context.Context,prefix string) error {
	var keys []string

	// วนลูปหา Key ที่ขึ้นต้นด้วย prefix (เช่น "holidays:*")
	// เราใช้ Scan แทน Keys เพราะ Keys จะทำให้ Redis ค้างถ้าข้อมูลเยอะ
	iter := r.rdb.Scan(ctx, 0, prefix+"*", 0).Iterator()
	
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return err
	}

	// ถ้าเจอ Key ก็สั่งลบทีเดียว
	if len(keys) > 0 {
		if err := r.rdb.Del(ctx, keys...).Err(); err != nil {
			return err
		}
	}

	return nil
}

func (r *redisRepository) SetJsonCache(ctx context.Context, cacheKey string, jsonBytes []byte) {
	err := r.rdb.Set(ctx, cacheKey, jsonBytes, 7*24*time.Hour).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
	}
}

func (r *redisRepository) DeleteBookingToCache(ctx context.Context, roomNumber uint) {
	prefix := fmt.Sprintf("booking:%d", roomNumber)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}

func (r *redisRepository) DeleteUserToCache(ctx context.Context, userID uuid.UUID) {
	prefix := fmt.Sprintf("booking:user:%s", userID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
} 