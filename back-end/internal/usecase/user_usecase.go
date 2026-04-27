package usecase

import (
	"context"
	"errors"
	"math"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
)

type userUsecase struct {
	db domain.UserPostgresRepo
}

// NewBookingUsecase คือ Constructor
func NewUserUsecase(
	db domain.UserPostgresRepo) domain.UserUsecase {
	return &userUsecase{
		db: db,
	}
}

func (u *userUsecase) UpdateUserStatus(ctx context.Context, userID uuid.UUID, newStatus string) error {
	if newStatus != "active" && newStatus != "inactive" {
		return errors.New("invalid status: must be 'active' or 'inactive'")
	}

	if err := u.db.UpdateUserStatusDB(ctx, userID, newStatus); err != nil {
		return err
	}

	return nil
}

func (u *userUsecase) GetPaginatedUsers(ctx context.Context, q *domain.UserPaginationQuery) (*domain.PaginatedUserResponse, error) {
	// 1. จัดการ Default
	if q.Page <= 0 {
		q.Page = 1
	}
	if q.Limit <= 0 {
		q.Limit = 5
	}

	// 2. เรียก Repo รับของดิบมา
	users, totalItems, err := u.db.GetPaginatedUsersDB(ctx, q)
	if err != nil {
		return nil, err
	}

	// 3. คำนวณ Logic
	totalPages := int(math.Ceil(float64(totalItems) / float64(q.Limit)))
	var indexOfFirstItem, indexOfLastItem int

	if totalItems > 0 {
		indexOfFirstItem = ((q.Page - 1) * q.Limit) + 1
		indexOfLastItem = q.Page * q.Limit
		if int64(indexOfLastItem) > totalItems {
			indexOfLastItem = int(totalItems)
		}
	} else {
		indexOfFirstItem = 0
		indexOfLastItem = 0
	}

	// 4. ⭐️ ประกอบร่างและ Return ทีเดียว
	return &domain.PaginatedUserResponse{
		Data: users,
		Meta: domain.PaginationMeta{
			TotalItems:       totalItems,
			ItemsPerPage:     q.Limit,
			TotalPages:       totalPages,
			CurrentPage:      q.Page,
			IndexOfFirstItem: indexOfFirstItem,
			IndexOfLastItem:  indexOfLastItem,
		},
	}, nil
}

func (u *userUsecase) GetUserOverview(ctx context.Context, userID uuid.UUID) (*domain.UserOverviewResponse, error) {
	userOverviewResponse, err := u.db.GetUserOverviewDB(ctx, userID)
	if err != nil {
		return nil, err
	}

	return userOverviewResponse, nil
}

func (u *userUsecase) GetPaginatedUserBookings(ctx context.Context, userID uuid.UUID, q *domain.BookingPaginationQuery) (*domain.PaginatedBookingResponse, error) {
	if q.Page <= 0 {
		q.Page = 1
	}
	if q.Limit <= 0 {
		q.Limit = 4
	}

	bookings, totalItems, err := u.db.GetPaginatedUserBookingsDB(ctx, userID, q)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(totalItems) / float64(q.Limit)))
	var indexOfFirstItem, indexOfLastItem int

	if totalItems > 0 {
		indexOfFirstItem = ((q.Page - 1) * q.Limit) + 1
		indexOfLastItem = q.Page * q.Limit
		if int64(indexOfLastItem) > totalItems {
			indexOfLastItem = int(totalItems)
		}
	} else {
		indexOfFirstItem = 0
		indexOfLastItem = 0
	}

	return &domain.PaginatedBookingResponse{
		Data: bookings,
		Meta: domain.PaginationMeta{
			TotalItems:       totalItems,
			ItemsPerPage:     q.Limit,
			TotalPages:       totalPages,
			CurrentPage:      q.Page,
			IndexOfFirstItem: indexOfFirstItem,
			IndexOfLastItem:  indexOfLastItem,
		},
	}, nil
}