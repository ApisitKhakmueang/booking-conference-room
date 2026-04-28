package redisRepo

import (
	"github.com/redis/go-redis/v9"
)

type roomRedisRepo struct {
	*BaseRedisRepo
}

func NewRoomRedisRepo(rdb *redis.Client) *roomRedisRepo {
	return &roomRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
	}
}