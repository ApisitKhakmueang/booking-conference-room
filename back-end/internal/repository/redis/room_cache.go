package redisRepo

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type roomRedisRepo struct {
	*BaseRedisRepo
}

func NewRoomRedisRepo(rdb *redis.Client) domain.RoomRedisRepo {
	return &roomRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
	}
}