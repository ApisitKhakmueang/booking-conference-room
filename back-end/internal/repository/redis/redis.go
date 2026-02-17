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

	prefix := fmt.Sprintf("booking:%d:", roomNumber)

	if err := r.ClearCacheByPrefix(ctx, prefix); err != nil {
		return err
	}

	return nil
}

func (r *redisRepository) GetBooking(ctx context.Context,dateTime *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, dateTime.StartStr, dateTime.EndStr)

	var bookings []domain.Booking
	val, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		// เจอข้อมูล! (Cache Hit)
		// log.Println("Cache hit")
		
		// แปลง JSON string กลับมาเป็น Struct (Unmarshal)
		if err := json.Unmarshal([]byte(val), &bookings); err == nil {
			// log.Println("Cache HIT: Return data from Redis")
			return bookings, nil
		}
		// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
	}

	bookings, err = r.postgres.GetBookingDB(ctx, dateTime, roomID)

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		// ใช้ ctx ตัวเดิมส่งให้ Redis ด้วย
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
		return bookings, nil
	}

	return nil, err
}

func (r *redisRepository) GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	var holidays []domain.Holiday
	val, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		// เจอข้อมูล! (Cache Hit)
		// log.Println("Cache hit")
		
		// แปลง JSON string กลับมาเป็น Struct (Unmarshal)
		if err := json.Unmarshal([]byte(val), &holidays); err == nil {
			// log.Println("Cache HIT: Return data from Redis")
			return holidays, nil
		}
		// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
	}

	holidays, err = r.postgres.GetHolidayDB(ctx, date)

	if jsonBytes, err := json.Marshal(holidays); err == nil {
		// ตั้ง TTL (เช่น 24 ชั่วโมง เพราะวันหยุดไม่น่าเปลี่ยนบ่อย)
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return nil, err
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
