// internal/repository/redis/base_redis.go
package redisRepo

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// BaseRedisRepo จะเป็นตัวเก็บ Connection และฟังก์ชันกลาง
type BaseRedisRepo struct {
	rdb *redis.Client
}

// 1. ฟังก์ชัน Set Cache กลาง
func (b *BaseRedisRepo) ClearCacheByPrefix(ctx context.Context,prefix string) error {
	var keys []string

	// วนลูปหา Key ที่ขึ้นต้นด้วย prefix (เช่น "holidays:*")
	// เราใช้ Scan แทน Keys เพราะ Keys จะทำให้ Redis ค้างถ้าข้อมูลเยอะ
	iter := b.rdb.Scan(ctx, 0, prefix+"*", 0).Iterator()
	
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return err
	}

	// ถ้าเจอ Key ก็สั่งลบทีเดียว
	if len(keys) > 0 {
		if err := b.rdb.Del(ctx, keys...).Err(); err != nil {
			return err
		}
	}

	return nil
}

func (b *BaseRedisRepo) SetJsonCache(ctx context.Context, cacheKey string, jsonBytes []byte) {
	err := b.rdb.Set(ctx, cacheKey, jsonBytes, 7*24*time.Hour).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
	}
}

func (b *BaseRedisRepo) DeleteBookingCache(ctx context.Context, roomNumber uint) {
	prefix := fmt.Sprintf("booking:%d", roomNumber)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := b.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}

func (b *BaseRedisRepo) DeleteUserCache(ctx context.Context, userID uuid.UUID) {
	prefix := fmt.Sprintf("booking:user:%s", userID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := b.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
} 

func (b *BaseRedisRepo) DeleteHistoryCache(ctx context.Context, userID uuid.UUID) {
	prefix := fmt.Sprintf("history:user:%s", userID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := b.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
} 

func (b *BaseRedisRepo) DeleteSpecificRoomCache(ctx context.Context, roomID uuid.UUID) {
	prefix := fmt.Sprintf("room:%s", roomID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := b.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}

func (b *BaseRedisRepo) DeleteRoomDetailsCache(ctx context.Context) {
	prefix := "room:details"
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := b.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}

func (p *redisPub) PublishEvent(ctx context.Context, event string, payload interface{}) error {
	// ห่อข้อมูลเป็น JSON
	// log.Println("enter publish event")
	data, _ := json.Marshal(map[string]interface{}{
		"type": event,   // เช่น "create", "update"
		"data": payload, // ข้อมูล booking
	})
	
	// ส่งเข้า Channel ชื่อ "bookings_realtime"
	return p.rdb.Publish(ctx, "bookings_realtime", data).Err()
}