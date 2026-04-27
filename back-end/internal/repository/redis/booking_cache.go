package redisRepo

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type bookingRedisRepo struct {
	*BaseRedisRepo
	postgres domain.BookingPostgresRepo
}

func NewBookingRedisRepo(rdb *redis.Client, postgres domain.BookingPostgresRepo) *bookingRedisRepo {
	return &bookingRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb:rdb},
		postgres: postgres,
	}
}

func (r *bookingRedisRepo) ClearCacheAfterCreateBooking(ctx context.Context, userID uuid.UUID, roomNumber uint) {
	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, userID)
}

func (r *bookingRedisRepo) ClearCacheAfterUpdateBooking(ctx context.Context, userID uuid.UUID, roomNumber uint, prevRoomNumber uint) {
	// 1. ลบ Cache ห้องเก่า (เพื่อให้ข้อมูลที่ย้ายออกหายไป)
	r.DeleteBookingCache(ctx, prevRoomNumber)

	// 2. ลบ Cache ห้องใหม่ (เพื่อให้ข้อมูลที่ย้ายเข้าอัปเดต)
	// ต่อให้ห้องจะเป็นห้องเดิม การสั่ง Delete ซ้ำที่ Key เดิมใน Redis ไม่ทำให้เกิด Error ครับ
	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, userID)
}

func (r *bookingRedisRepo) ClearCacheAfterDeleteBooking(ctx context.Context, userID uuid.UUID, roomNumber uint) {
	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, userID)
	r.DeleteHistoryCache(ctx, userID)
}

func (r *bookingRedisRepo) ClearCacheAfterCheckOutBooking(ctx context.Context, userID uuid.UUID, roomNumber uint) {
	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, userID)
	r.DeleteHistoryCache(ctx, userID)
}

// รับ cacheKey เข้ามาตรงๆ เลย!
func (r *bookingRedisRepo) GetBookingCacheByKey(ctx context.Context, cacheKey string) ([]domain.Booking, error) {
	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, err // คืนค่า redis.Nil กลับไป
	}

	var bookings []domain.Booking
	if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
		return nil, err
	}

	return bookings, nil
}

// Internal Function
func (r *bookingRedisRepo) ClearCacheByPrefix(ctx context.Context,prefix string) error {
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

func (r *bookingRedisRepo) SetBookingCache(ctx context.Context, cacheKey string, bookings []domain.Booking) {
	jsonBytes, err := json.Marshal(bookings)
	if err != nil {
		log.Printf("Failed to marshal: %v", err) // เรียกใช้ฟังก์ชันจาก BaseRedisRepo ของคุณ
	}

	err = r.rdb.Set(ctx, cacheKey, jsonBytes, 7*24*time.Hour).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
	}
}

func (r *bookingRedisRepo) DeleteBookingCache(ctx context.Context, roomNumber uint) {
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

func (r *bookingRedisRepo) DeleteUserCache(ctx context.Context, userID uuid.UUID) {
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

func (r *bookingRedisRepo) DeleteHistoryCache(ctx context.Context, userID uuid.UUID) {
	prefix := fmt.Sprintf("history:user:%s", userID)
	
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

func (r *bookingRedisRepo) DeleteSpecificRoomCache(ctx context.Context, roomID uuid.UUID) {
	prefix := fmt.Sprintf("room:%s", roomID)
	
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

func (r *bookingRedisRepo) DeleteRoomDetailsCache(ctx context.Context) {
	prefix := "room:details"
	
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