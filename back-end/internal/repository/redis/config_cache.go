package redisRepo

import (
	"context"
	"fmt"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type configRedisRepo struct {
	*BaseRedisRepo
}

func NewConfigRedisRepo(rdb *redis.Client) *configRedisRepo {
	return &configRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
	}
}

func (r *configRedisRepo) FindHolidaySynced(ctx context.Context, date *domain.Date) int64 {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)

	exists, _ := r.rdb.Exists(ctx, key).Result()
	return exists
}

func (r *configRedisRepo) SetHolidaySynced(ctx context.Context, date *domain.Date) error {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)
	// ตั้ง TTL ตามความเหมาะสม เช่น 1 วัน หรือ 7 วัน (ถ้า Google Calendar ไม่ได้แก้บ่อย)
	// ข้อมูลใน DB จะถือว่า "สดใหม่" เท่ากับระยะเวลา TTL นี้
	return r.rdb.Set(ctx, key, "1", 7*24*time.Hour).Err()
}

func (r *configRedisRepo) DeleteHolidayCache(ctx context.Context, date *domain.Date) error {
	// 1. สร้าง Key ให้เหมือนกับตอน Get เป๊ะๆ
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	// 2. สั่งลบ (Del)
	if err := r.rdb.Del(ctx, cacheKey).Err(); err != nil {
		return err // หรือจะแค่ log ก็ได้ ถ้าซีเรียส
	}
	return nil
}