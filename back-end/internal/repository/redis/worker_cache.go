package redisRepo

import (
	"context"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type workerRedisRepo struct {
	*BaseRedisRepo
	postgres domain.WorkerPostgresRepo
}

func NewWorkerRedisRepo(rdb *redis.Client, postgres domain.WorkerPostgresRepo) *workerRedisRepo {
	return &workerRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb: rdb},
		postgres:      postgres,
	}
}

func (r *workerRedisRepo) UpdateBookingEndStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error) {
	roomNumber, err := r.postgres.GetRoomNumberDB(ctx, bookingID)
	if err != nil {
		return nil, 0, err
	}

	updateBooking, err := r.postgres.UpdateBookingStatusDB(ctx, bookingID, "complete")
	if err != nil {
		return nil, 0, err
	}

	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, updateBooking.UserID)
	r.DeleteHistoryCache(ctx, updateBooking.UserID)

	return updateBooking, roomNumber, nil
}

func (r *workerRedisRepo) UpdateBookingNoshowStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error) {
	roomNumber, err := r.postgres.GetRoomNumberDB(ctx, bookingID)
	if err != nil {
		return nil, 0, err
	}

	updateBooking, err := r.postgres.UpdateBookingStatusDB(ctx, bookingID, "no_show")
	if err != nil {
		return nil, 0, err
	}

	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, updateBooking.UserID)
	r.DeleteHistoryCache(ctx, updateBooking.UserID)

	return updateBooking, roomNumber, nil
}