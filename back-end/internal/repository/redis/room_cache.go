package redisRepo

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
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

func (r *roomRedisRepo) CreateRoom(ctx context.Context, room *domain.Room) error {
	if err := r.postgres.CreateRoomDB(ctx, room); err != nil {
		return err
	}

	r.DeleteRoomDetailsCache(ctx)

	return nil
}

func (r *roomRedisRepo) UpdateRoom(ctx context.Context, room *domain.Room) error {
	if err := r.postgres.UpdateRoomDB(ctx, room); err != nil {
		return err
	}

	// 1. เคลียร์ Cache ของห้องเก่า (ถ้าห้องเปลี่ยน มันจะลบห้องเก่าให้)
	r.DeleteSpecificRoomCache(ctx, room.ID)
	r.DeleteRoomDetailsCache(ctx)

	return nil
}

func (r *roomRedisRepo) DeleteRoom(ctx context.Context, roomID uuid.UUID) error {
	if err := r.postgres.DeleteRoomDB(ctx, roomID);err != nil {
		return err
	}

	r.DeleteSpecificRoomCache(ctx, roomID)
	r.DeleteRoomDetailsCache(ctx)
	
	return nil
}

func (r *roomRedisRepo) GetRoom(ctx context.Context) ([]domain.Room, error) {
	cacheKey := "room:details"

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var rooms []domain.Room
		if err := json.Unmarshal([]byte(vals), &rooms); err != nil {
			return nil, err
		}

		return rooms, nil
	}

	rooms, err := r.postgres.GetRoomDB(ctx)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(rooms); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return rooms, nil
}

func (r *roomRedisRepo) GetRoomByID(ctx context.Context, roomID uuid.UUID) (*domain.Room, error) {
	cacheKey := fmt.Sprintf("room:%s", roomID)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		room := new(domain.Room)
		if err := json.Unmarshal([]byte(vals), &room); err != nil {
			return nil, err
		}

		return room, nil
	}

	room, err := r.postgres.GetRoomByID_DB(ctx, roomID)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(room); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return room, nil
}