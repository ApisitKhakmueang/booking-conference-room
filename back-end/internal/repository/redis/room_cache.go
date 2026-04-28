package redisRepo

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type roomRedisRepo struct {
	*BaseRedisRepo
	postgres domain.RoomPostgresRepo
}

func NewRoomRedisRepo(rdb *redis.Client, postgres domain.RoomPostgresRepo) *roomRedisRepo {
	return &roomRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
		postgres: postgres,
	}
}