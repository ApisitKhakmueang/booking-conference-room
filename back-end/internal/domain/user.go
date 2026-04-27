package domain

import (
	"context"

	"github.com/google/uuid"
)

type UserUsecase interface {
	UpdateUserStatus(ctx context.Context, userID uuid.UUID, newStatus string) error
	GetPaginatedUsers(ctx context.Context, q *UserPaginationQuery) (*PaginatedUserResponse, error)
	GetUserOverview(ctx context.Context, userID uuid.UUID) (*UserOverviewResponse, error)
	GetPaginatedUserBookings(ctx context.Context, userID uuid.UUID, q *BookingPaginationQuery) (*PaginatedBookingResponse, error)
}

type UserPostgresRepo interface {
	UpdateUserStatusDB(ctx context.Context, userID uuid.UUID, newStatus string) error
	GetPaginatedUsersDB(ctx context.Context, q *UserPaginationQuery) ([]User, int64, error)
	GetUserOverviewDB(ctx context.Context, userID uuid.UUID) (*UserOverviewResponse, error)
	GetPaginatedUserBookingsDB(ctx context.Context, userID uuid.UUID, q *BookingPaginationQuery) ([]UserBookingHistoryRes, int64, error)
}