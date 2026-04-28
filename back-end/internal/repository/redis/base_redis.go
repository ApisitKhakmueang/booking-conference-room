// internal/repository/redis/base_redis.go
package redisRepo

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// BaseRedisRepo จะเป็นตัวเก็บ Connection และฟังก์ชันกลาง
type BaseRedisRepo struct {
	rdb *redis.Client
}

// 1. ฟังก์ชัน Set Cache กลาง
func (b *BaseRedisRepo) SetCache(ctx context.Context, cacheKey string, data any, expiration time.Duration) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Failed to marshal: %v", err) // เรียกใช้ฟังก์ชันจาก BaseRedisRepo ของคุณ
		return
	}

	err = b.rdb.Set(ctx, cacheKey, jsonBytes, expiration).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
		return
	}
}

func (r *BaseRedisRepo) GetCache(ctx context.Context, cacheKey string, dest any) error {
	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err != nil {
		return err // คืนค่า redis.Nil กลับไป
	}

	if err := json.Unmarshal([]byte(vals), dest); err != nil {
		return err
	}

	return nil
}

func (b *BaseRedisRepo) DeleteCache(ctx context.Context, prefix string) {	
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