package redisRepo

import (
	"context"
	"encoding/json"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/redis/go-redis/v9"
)

type redisPub struct {
	rdb *redis.Client
}

func NewRedisPublisher(rdb *redis.Client) domain.RealtimePublisher {
	return &redisPub{rdb: rdb}
}

func (p *redisPub) PublishEvent(ctx context.Context, event string, payload interface{}) error {
	// ห่อข้อมูลเป็น JSON
	// log.Println("enter publish event")
	data, _ := json.Marshal(map[string]interface{}{
		"type": event,   // เช่น "create", "update"
		"data": payload, // ข้อมูล booking
	})
	
	// ส่งเข้า Channel ชื่อ "bookings_realtime"
	return p.rdb.Publish(ctx, "bookings_realtime", data).Err()
}