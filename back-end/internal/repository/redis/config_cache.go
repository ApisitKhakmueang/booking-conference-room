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

func NewConfigRedisRepo(rdb *redis.Client) domain.ConfigRedisRepo {
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

	return r.rdb.Set(ctx, key, "1", 7*24*time.Hour).Err()
}