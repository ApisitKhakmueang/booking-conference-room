package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type roomUsecase struct {
	BaseUsecase
	cache domain.RoomRedisRepo // เรียกผ่าน
	db 		domain.RoomPostgresRepo
}

// NewBookingUsecase คือ Constructor
func NewRoomUsecase(
		pub 	domain.RealtimePublisher,
		cache domain.RoomRedisRepo, 
		db 		domain.RoomPostgresRepo) domain.RoomUsecase {
	return &roomUsecase{ 
		BaseUsecase: 	NewBaseUsecase(pub),
		cache:				cache,
		db: 					db,
	}
}

func (u *roomUsecase) CreateRoom(ctx context.Context, room *domain.Room) error {
	room.ID = uuid.New()
	if err := u.db.CreateRoomDB(ctx, room); err != nil {
		return err
	}

	u.cache.DeleteCache(ctx, "room:details")

	return nil
}

func (u *roomUsecase) UpdateRoom(ctx context.Context, room *domain.Room) error {
	if err := u.db.UpdateRoomDB(ctx, room); err != nil {
		return err
	}

	prefix := fmt.Sprintf("room:%s", room.ID)
	u.cache.DeleteCache(ctx, prefix)
	u.cache.DeleteCache(ctx, "room:details")

	return nil
}

func (u *roomUsecase) DeleteRoom(ctx context.Context, roomID uuid.UUID) error {
	if err := u.db.DeleteRoomDB(ctx, roomID);err != nil {
		return err
	}

	prefix := fmt.Sprintf("room:%s", roomID)
	u.cache.DeleteCache(ctx, prefix)
	u.cache.DeleteCache(ctx, "room:details")

	return nil
}

func (u *roomUsecase) GetRoom(ctx context.Context) ([]domain.Room, error) {
	cacheKey := "room:details"

	var rooms []domain.Room
	err := u.cache.GetCache(ctx, cacheKey, &rooms)
	
	if err != nil { 
		// 3.1 ดึงจาก Postgres
		rooms, err := u.db.GetRoomDB(ctx)
		if err != nil {
			return nil, err
		}

		u.RunInBackground(5*time.Second, func(bgCtx context.Context) {
			// 🌟 ใส่แค่คำสั่งที่คุณต้องการให้ทำหลังบ้านจริงๆ
			u.cache.SetCache(bgCtx, cacheKey, rooms, 7*24*time.Hour)
		})
	}

	return rooms, nil
}

func (u *roomUsecase) GetRoomByID(ctx context.Context, roomID uuid.UUID) (*domain.Room, error) {
	cacheKey := fmt.Sprintf("room:%s", roomID)

	room := new(domain.Room)
	err := u.cache.GetCache(ctx, cacheKey, room)
	
	if err != nil { 
		// 3.1 ดึงจาก Postgres
		room, err := u.db.GetRoomByID_DB(ctx, roomID)
		if err != nil {
			return nil, err
		}

		u.RunInBackground(5*time.Second, func(bgCtx context.Context) {
			// 🌟 ใส่แค่คำสั่งที่คุณต้องการให้ทำหลังบ้านจริงๆ
			u.cache.SetCache(bgCtx, cacheKey, room, 7*24*time.Hour)
		})
	}

	return room, nil
}