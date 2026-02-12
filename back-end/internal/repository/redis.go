package repository

import (
	"context"
	"encoding/json"
	"time"
	"log"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type RedisRepository struct {
	ctx context.Context
	rdb *redis.Client
}

func NewRedisRepository(ctx context.Context, rdb *redis.Client) domain.RedisRepository {
	return &RedisRepository{
		ctx: ctx,
		rdb: rdb,
	}
}

func (r *RedisRepository) GetBookingRedis(cacheKey string) ([]domain.Booking, error) {
	var bookings []domain.Booking
	val, err := r.rdb.Get(r.ctx, cacheKey).Result()
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

	return nil, err
}

func (r *RedisRepository) GetHolidayRedis(cacheKey string) ([]domain.Holiday, error) {
	var holidays []domain.Holiday
	val, err := r.rdb.Get(r.ctx, cacheKey).Result()
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

	return nil, err
}

func (r *RedisRepository) SetJsonCache(cacheKey string, jsonBytes []byte) {
	err := r.rdb.Set(r.ctx, cacheKey, jsonBytes, 7*24*time.Hour).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
	}
}

func (r *RedisRepository) SetHolidaySynced(cacheKey string) error {
	return r.rdb.Set(r.ctx, cacheKey, "1", 7*24*time.Hour).Err()
}

func (r *RedisRepository) DeleteCache(cacheKey ...string) error {
	return r.rdb.Del(r.ctx, cacheKey...).Err()
}

func (r *RedisRepository) IsHolidaySynced(cacheKey string) int64 {
	exists, _ := r.rdb.Exists(r.ctx, cacheKey).Result()
	return exists
}

func (r *RedisRepository) ClearCacheByPrefix(prefix string) error {
	var keys []string

	// วนลูปหา Key ที่ขึ้นต้นด้วย prefix (เช่น "holidays:*")
	// เราใช้ Scan แทน Keys เพราะ Keys จะทำให้ Redis ค้างถ้าข้อมูลเยอะ
	iter := r.rdb.Scan(r.ctx, 0, prefix+"*", 0).Iterator()
	
	for iter.Next(r.ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return err
	}

	// ถ้าเจอ Key ก็สั่งลบทีเดียว
	if len(keys) > 0 {
		if err := r.rdb.Del(r.ctx, keys...).Err(); err != nil {
			return err
		}
	}

	return nil
}