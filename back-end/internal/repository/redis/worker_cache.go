package redisRepo

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type workerRedisRepo struct {
	*BaseRedisRepo
}

func NewWorkerRedisRepo(rdb *redis.Client) domain.WorkerRedisRepo {
	return &workerRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
	}
}