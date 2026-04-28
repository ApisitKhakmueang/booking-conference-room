package redisRepo

import (
	"context"

	"github.com/redis/go-redis/v9"
)

type bookingRedisRepo struct {
	*BaseRedisRepo
}

func NewBookingRedisRepo(rdb *redis.Client) *bookingRedisRepo {
	return &bookingRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb:rdb},
	}
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