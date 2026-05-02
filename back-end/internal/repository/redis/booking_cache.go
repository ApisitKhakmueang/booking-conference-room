package redisRepo

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type bookingRedisRepo struct {
	*BaseRedisRepo
}

func NewBookingRedisRepo(rdb *redis.Client) domain.BookingRedisRepo {
	return &bookingRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb:rdb},
	}
}