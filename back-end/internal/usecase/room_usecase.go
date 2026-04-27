package usecase

import (
	"context"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type roomUsecase struct {
	cache domain.RoomRedisRepo // เรียกผ่าน
}

// NewBookingUsecase คือ Constructor
func NewRoomUsecase(cache domain.RoomRedisRepo) domain.RoomUsecase {
	return &roomUsecase{ cache:cache }
}

func (u *roomUsecase) CreateRoom(ctx context.Context, room *domain.Room) error {
	room.ID = uuid.New()
	if err := u.cache.CreateRoom(ctx, room); err != nil {
		return err
	}

	return nil
}

func (u *roomUsecase) UpdateRoom(ctx context.Context, room *domain.Room) error {
	if err := u.cache.UpdateRoom(ctx, room); err != nil {
		return err
	}

	return nil
}

func (u *roomUsecase) DeleteRoom(ctx context.Context, roomID uuid.UUID) error {
	if err := u.cache.DeleteRoom(ctx, roomID); err != nil {
		return err
	}

	return nil
}

func (u *roomUsecase) GetRoom(ctx context.Context) ([]domain.Room, error) {
	rooms, err := u.cache.GetRoom(ctx)
	if err != nil {
		return nil, err
	}

	return rooms, nil
}

func (u *roomUsecase) GetRoomByID(ctx context.Context, roomID uuid.UUID) (*domain.Room, error) {
	room, err := u.cache.GetRoomByID(ctx, roomID)
	if err != nil {
		return nil, err
	}

	return room, nil
}