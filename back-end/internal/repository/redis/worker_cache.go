package redisRepo

import (
	"github.com/redis/go-redis/v9"
)

type workerRedisRepo struct {
	*BaseRedisRepo
}

func NewWorkerRedisRepo(rdb *redis.Client) *workerRedisRepo {
	return &workerRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
	}
}