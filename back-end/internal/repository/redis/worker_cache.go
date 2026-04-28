package redisRepo

import (

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type workerRedisRepo struct {
	*BaseRedisRepo
	postgres domain.WorkerPostgresRepo
}

func NewWorkerRedisRepo(rdb *redis.Client, postgres domain.WorkerPostgresRepo) *workerRedisRepo {
	return &workerRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
		postgres:      postgres,
	}
}