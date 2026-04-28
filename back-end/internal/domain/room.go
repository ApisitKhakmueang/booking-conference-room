package domain

import (
	"context"

	"github.com/google/uuid"
)

type RoomUsecase interface {
	CreateRoom(ctx context.Context, room *Room) error
	UpdateRoom(ctx context.Context, room *Room) error
	DeleteRoom(ctx context.Context, roomID uuid.UUID) error
	GetRoom(ctx context.Context) ([]Room, error)
	GetRoomByID(ctx context.Context, roomID uuid.UUID) (*Room, error)
}

type RoomRedisRepo interface {
	RedisCacheRepository
}

type RoomPostgresRepo interface {
	CreateRoomDB(ctx context.Context, room *Room) error
	UpdateRoomDB(ctx context.Context, room *Room) error
	DeleteRoomDB(ctx context.Context, roomID uuid.UUID) error
	GetRoomDB(ctx context.Context) ([]Room, error)
	GetRoomByID_DB(ctx context.Context, roomID uuid.UUID) (*Room, error)
}