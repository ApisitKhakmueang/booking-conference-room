package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/mocks"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestCreateBooking tests the CreateBooking method
func TestCreateBooking(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful booking creation", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		roomID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		booking := &domain.Booking{
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Team Meeting",
			Room: &domain.Room{
				ID:         roomID,
				RoomNumber: 101,
			},
		}

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(nil)
		mockDB.On("IsRoomAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(true)
		mockDB.On("GetRoomID", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(101)).Return(nil).Once()
		mockDB.On("IsPasscodeAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking"), mock.AnythingOfType("string")).Return(true).Once()
		mockDB.On("CreateBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(booking, nil)
		mockCache.On("DeleteCache", mock.Anything, mock.Anything).Return(nil)
		mockPublisher.On("PublishEvent", mock.Anything, mock.Anything, mock.Anything).Return(nil)
		mockAsync.On("Enqueue", mock.Anything, mock.Anything).Return(&asynq.TaskInfo{}, nil)

		err := usecase.CreateBooking(ctx, booking, 101)

		assert.NoError(t, err)
	})

	t.Run("Config not found error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		booking := &domain.Booking{
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(nil, errors.New("config not found"))

		err := usecase.CreateBooking(ctx, booking, 101)

		assert.Error(t, err)
		assert.Equal(t, "config not found", err.Error())
	})

	t.Run("Room not available", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		booking := &domain.Booking{
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(nil)
		mockDB.On("GetRoomID", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(101)).Return(nil).Once()
		mockDB.On("IsRoomAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(false)

		err := usecase.CreateBooking(ctx, booking, 101)

		assert.Error(t, err)
	})

	t.Run("Day off date", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		booking := &domain.Booking{
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(errors.New("This day is day off"))

		err := usecase.CreateBooking(ctx, booking, 101)

		assert.Error(t, err)
	})

	t.Run("Create booking database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		booking := &domain.Booking{
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(nil)
		mockDB.On("IsRoomAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(true)
		mockDB.On("GetRoomID", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(101)).Return(nil)
		mockDB.On("IsPasscodeAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking"), mock.AnythingOfType("string")).Return(true)
		mockDB.On("CreateBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(nil, errors.New("database error"))

		err := usecase.CreateBooking(ctx, booking, 101)

		assert.Error(t, err)
	})
}

// TestUpdateBooking tests the UpdateBooking method
func TestUpdateBooking(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful booking update", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		roomID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 17, 0, 0, 0, location)

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		booking := &domain.Booking{
			ID:        bookingID,
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Updated Meeting",
			Room: &domain.Room{
				ID:         roomID,
				RoomNumber: 102,
			},
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("IsRoomAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(true)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(nil)
		mockDB.On("GetRoomID", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(102)).Return(nil)
		mockDB.On("GetRoomNumberDB", mock.Anything, bookingID).Return(uint(101), nil)
		mockDB.On("UpdateBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(booking, nil)
		mockCache.On("DeleteCache", mock.Anything, mock.Anything).Return(nil)
		mockPublisher.On("PublishEvent", mock.Anything, mock.Anything, mock.Anything).Return(nil)
		mockAsync.On("Enqueue", mock.Anything, mock.Anything).Return(&asynq.TaskInfo{}, nil)

		err := usecase.UpdateBooking(ctx, booking, 102)

		assert.NoError(t, err)
	})

	t.Run("Get previous room number fails", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 17, 0, 0, 0, location)

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		booking := &domain.Booking{
			ID:        bookingID,
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("IsRoomAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(true)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(nil)
		mockDB.On("GetRoomID", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(102)).Return(nil)
		mockDB.On("GetRoomNumberDB", mock.Anything, bookingID).Return(uint(0), errors.New("booking not found"))

		err := usecase.UpdateBooking(ctx, booking, 102)

		assert.Error(t, err)
	})

	t.Run("Update booking database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 17, 0, 0, 0, location)

		config := &domain.Config{
			StartTime:           	"08:00", // เวลาเปิด
			EndTime:             	"20:00", // เวลาปิด (ต้องไม่เป็น 00:00 หรือค่าว่าง)
			MaxAdvanceDays: 			30,
			MaxBookingMins: 			120,
			NoShowThresholdMins: 	15,
    }

		booking := &domain.Booking{
			ID:        bookingID,
			UserID:    userID,
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetConfigDB", mock.Anything).Return(config, nil)
		mockDB.On("IsRoomAvailable", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(true)
		mockDB.On("CheckDayOff", mock.Anything, mock.Anything).Return(nil)
		mockDB.On("GetRoomID", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(102)).Return(nil)
		mockDB.On("GetRoomNumberDB", mock.Anything, bookingID).Return(uint(101), nil)
		mockDB.On("UpdateBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(nil, errors.New("update failed"))

		err := usecase.UpdateBooking(ctx, booking, 102)

		assert.Error(t, err)
	})
}

// TestDeleteBooking tests the DeleteBooking method
func TestDeleteBooking(t *testing.T) {
	ctx := context.Background()

	t.Run("Successful booking deletion", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		roomID := uuid.New()

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
			Room: &domain.Room{
				ID:         roomID,
				RoomNumber: 101,
			},
		}

		mockDB.On("GetBookingByID", mock.Anything, bookingID).Return(booking, nil)
		mockDB.On("DeleteBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(booking, nil)
		mockCache.On("DeleteCache", mock.Anything, mock.Anything).Return(nil)
		mockPublisher.On("PublishEvent", mock.Anything, mock.Anything, mock.Anything).Return(nil)
		mockPublisher.On("PublishStatus", mock.Anything, mock.Anything).Return(nil)
		mockAsync.On("Enqueue", mock.Anything, mock.Anything).Return(&asynq.TaskInfo{}, nil)

		err := usecase.DeleteBooking(ctx, booking)

		assert.NoError(t, err)
	})

	t.Run("Booking not found", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
		}

		mockDB.On("GetBookingByID", mock.Anything, bookingID).Return(nil, errors.New("booking not found"))

		err := usecase.DeleteBooking(ctx, booking)

		assert.Error(t, err)
	})

	t.Run("Delete booking database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		roomID := uuid.New()

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
			Room: &domain.Room{
				ID:         roomID,
				RoomNumber: 101,
			},
		}

		mockDB.On("GetBookingByID", mock.Anything, bookingID).Return(booking, nil)
		mockDB.On("DeleteBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(nil, errors.New("delete failed"))

		err := usecase.DeleteBooking(ctx, booking)

		assert.Error(t, err)
	})
}

// TestCheckOutBooking tests the CheckOutBooking method
func TestCheckOutBooking(t *testing.T) {
	ctx := context.Background()

	t.Run("Successful checkout", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		roomID := uuid.New()

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
			Room: &domain.Room{
				ID:         roomID,
				RoomNumber: 101,
			},
		}

		mockDB.On("GetBookingByID", mock.Anything, bookingID).Return(booking, nil)
		mockDB.On("CheckOutBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(booking, nil)
		mockCache.On("DeleteCache", mock.Anything, mock.Anything).Return(nil)
		mockPublisher.On("PublishEvent", mock.Anything, mock.Anything, mock.Anything).Return(nil)
		mockPublisher.On("PublishStatus", mock.Anything, mock.Anything).Return(nil)
		mockAsync.On("Enqueue", mock.Anything, mock.Anything).Return(&asynq.TaskInfo{}, nil)

		err := usecase.CheckOutBooking(ctx, booking)

		assert.NoError(t, err)
	})

	t.Run("Booking not found for checkout", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
		}

		mockDB.On("GetBookingByID", mock.Anything, bookingID).Return(nil, errors.New("booking not found"))

		err := usecase.CheckOutBooking(ctx, booking)

		assert.Error(t, err)
	})

	t.Run("Checkout database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		bookingID := uuid.New()
		roomID := uuid.New()

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
			Room: &domain.Room{
				ID:         roomID,
				RoomNumber: 101,
			},
		}

		mockDB.On("GetBookingByID", mock.Anything, bookingID).Return(booking, nil)
		mockDB.On("CheckOutBookingDB", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(nil, errors.New("checkout failed"))

		err := usecase.CheckOutBooking(ctx, booking)

		assert.Error(t, err)
	})
}

// TestCheckInBooking tests the CheckInBooking method
func TestCheckInBooking(t *testing.T) {
	ctx := context.Background()

	t.Run("Successful check-in", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		roomID := uuid.New()
		passcode := "1234"

		mockDB.On("CheckInBooking", mock.Anything, roomID, passcode).Return(nil)

		err := usecase.CheckInBooking(ctx, roomID, passcode)

		assert.NoError(t, err)
	})

	t.Run("Invalid passcode", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		roomID := uuid.New()
		passcode := "wrong"

		mockDB.On("CheckInBooking", mock.Anything, roomID, passcode).Return(errors.New("invalid passcode"))

		err := usecase.CheckInBooking(ctx, roomID, passcode)

		assert.Error(t, err)
		assert.Equal(t, "invalid passcode", err.Error())
	})

	t.Run("Room not found for check-in", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		roomID := uuid.New()
		passcode := "1234"

		mockDB.On("CheckInBooking", mock.Anything, roomID, passcode).Return(errors.New("room not found"))

		err := usecase.CheckInBooking(ctx, roomID, passcode)

		assert.Error(t, err)
	})
}

// TestGetBookingByDay tests the GetBookingByDay method
func TestGetBookingByDay(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful retrieval with bookings", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				Title:     "Meeting 1",
				StartTime: &startTime,
				EndTime:   &endTime,
			},
		}

		mockDB.On("GetBookingByDayDB", mock.Anything, mock.AnythingOfType("*domain.Date")).Return(bookings, nil)

		result, err := usecase.GetBookingByDay(ctx, "2026-04-22")

		assert.NoError(t, err)
		assert.NotNil(t, result)
	})

	t.Run("Empty bookings list", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		mockDB.On("GetBookingByDayDB", mock.Anything, mock.AnythingOfType("*domain.Date")).Return([]domain.Booking{}, nil)

		result, err := usecase.GetBookingByDay(ctx, "2026-04-22")

		assert.NoError(t, err)
		assert.Empty(t, result)
	})

	t.Run("Database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		mockDB.On("GetBookingByDayDB", mock.Anything, mock.AnythingOfType("*domain.Date")).Return(nil, errors.New("database error"))

		result, err := usecase.GetBookingByDay(ctx, "2026-04-22")

		assert.Error(t, err)
		assert.Nil(t, result)
	})

	t.Run("Invalid date format", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		result, err := usecase.GetBookingByDay(ctx, "invalid-date")

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestGetUpNextBooking tests the GetUpNextBooking method
func TestGetUpNextBooking(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful retrieval with booking", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		booking := &domain.Booking{
			Title:     "Next Meeting",
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetUpNextBookingDB", mock.Anything, mock.Anything).Return(booking, nil)

		result, err := usecase.GetUpNextBooking(ctx, "2026-04-22")

		assert.NoError(t, err)
		assert.NotNil(t, result)
	})

	t.Run("No booking found", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		mockDB.On("GetUpNextBookingDB", mock.Anything, mock.Anything).Return(nil, nil)

		result, err := usecase.GetUpNextBooking(ctx, "2026-04-22")

		assert.NoError(t, err)
		assert.Nil(t, result)
	})

	t.Run("Database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		mockDB.On("GetUpNextBookingDB", mock.Anything, mock.Anything).Return(nil, errors.New("database error"))

		result, err := usecase.GetUpNextBooking(ctx, "2026-04-22")

		assert.Error(t, err)
		assert.Nil(t, result)
	})

	t.Run("Invalid date format", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		result, err := usecase.GetUpNextBooking(ctx, "invalid-date")

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestGetAnalyticBooking tests the GetAnalyticBooking method
func TestGetAnalyticBooking(t *testing.T) {
	ctx := context.Background()

	t.Run("Successful analytics retrieval with cache miss", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		bookings := []domain.Booking{
			{
				Title:  "Meeting 1",
				Status: stringPtr("complete"),
				Room: &domain.Room{
					ID:         uuid.New(),
					RoomNumber: 101,
					Name:       "Room A",
				},
			},
			{
				Title:  "Meeting 2",
				Status: stringPtr("complete"),
				Room: &domain.Room{
					ID:         uuid.New(),
					RoomNumber: 101,
					Name:       "Room B",
				},
			},
			{
				Title:  "Meeting 2",
				Status: stringPtr("complete"),
				Room: &domain.Room{
					ID:         uuid.New(),
					RoomNumber: 101,
					Name:       "Room C",
				},
			},
		}

		date := &domain.Date{
			StartStr: "2026-04-01",
			EndStr:   "2026-04-30",
		}

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetAnalyticBookingDB", mock.Anything, date).Return(bookings, nil)
		mockCache.On("SetCache", mock.Anything, mock.Anything, mock.Anything, mock.Anything).
        Return(nil).Maybe()

		result, err := usecase.GetAnalyticBooking(ctx, date)

		assert.NoError(t, err)
		assert.NotNil(t, result)
	})

	t.Run("Empty bookings returns empty response", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		date := &domain.Date{
			StartStr: "2026-04-01",
			EndStr:   "2026-04-30",
		}

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetAnalyticBookingDB", mock.Anything, date).Return([]domain.Booking{}, nil)

		result, err := usecase.GetAnalyticBooking(ctx, date)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Empty(t, result.PopularRooms)
	})

	t.Run("Database error", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		date := &domain.Date{
			StartStr: "2026-04-01",
			EndStr:   "2026-04-30",
		}

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetAnalyticBookingDB", mock.Anything, date).Return(nil, errors.New("database error"))

		result, err := usecase.GetAnalyticBooking(ctx, date)

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestGetBookingStatus tests the GetBookingStatus method
func TestGetBookingStatus(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful status retrieval with bookings", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				Title:     "Status Meeting",
				StartTime: &startTime,
				EndTime:   &endTime,
			},
		}

		mockDB.On("GetBookingStatusDB", mock.Anything).Return(bookings, nil)

		result, err := usecase.GetBookingStatus(ctx)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 1, len(result))
	})

	t.Run("Empty bookings status", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		mockDB.On("GetBookingStatusDB", mock.Anything).Return([]domain.Booking{}, nil)

		result, err := usecase.GetBookingStatus(ctx)

		assert.NoError(t, err)
		assert.Empty(t, result)
	})

	t.Run("Database error on status retrieval", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		mockDB.On("GetBookingStatusDB", mock.Anything).Return(nil, errors.New("database error"))

		result, err := usecase.GetBookingStatus(ctx)

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestGetBookingStatusByRoomID tests the GetBookingStatusByRoomID method
func TestGetBookingStatusByRoomID(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful room status retrieval", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		roomID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		booking := &domain.Booking{
			Title:     "Room Status",
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		mockDB.On("GetBookingStatusByRoomID_DB", mock.Anything, roomID).Return(booking, nil)

		result, err := usecase.GetBookingStatusByRoomID(ctx, roomID)

		assert.NoError(t, err)
		assert.NotNil(t, result)
	})

	t.Run("Room not found", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		roomID := uuid.New()

		mockDB.On("GetBookingStatusByRoomID_DB", mock.Anything, roomID).Return(nil, errors.New("room not found"))

		result, err := usecase.GetBookingStatusByRoomID(ctx, roomID)

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestGetUserBooking tests the GetUserBooking method
func TestGetUserBooking(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful user booking retrieval with cache miss", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				Title:     "My Meeting",
				StartTime: &startTime,
				EndTime:   &endTime,
			},
		}

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetUserBookingDB", mock.Anything, userID, "2026-04-22").Return(bookings, nil)
		mockCache.On("SetCache", mock.Anything, mock.Anything, mock.Anything, mock.Anything).
        Return(nil).Maybe()

		result, err := usecase.GetUserBooking(ctx, userID, "2026-04-22")

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 1, len(result))
	})

	t.Run("Empty user bookings", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetUserBookingDB", mock.Anything, userID, "2026-04-22").Return([]domain.Booking{}, nil)
		mockCache.On("SetCache", mock.Anything, mock.Anything, mock.Anything, mock.Anything).
        Return(nil).Maybe()

		result, err := usecase.GetUserBooking(ctx, userID, "2026-04-22")

		assert.NoError(t, err)
		assert.Empty(t, result)
	})

	t.Run("Database error retrieving user bookings", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetUserBookingDB", mock.Anything, userID, "2026-04-22").Return(nil, errors.New("user not found"))

		result, err := usecase.GetUserBooking(ctx, userID, "2026-04-22")

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestGetUserHistory tests the GetUserHistory method
func TestGetUserHistory(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	ctx := context.Background()

	t.Run("Successful user history retrieval with cache miss", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()
		startTime := time.Date(2026, time.May, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.May, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				Title:     "Past Meeting",
				StartTime: &startTime,
				EndTime:   &endTime,
			},
		}

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetUserHistoryDB", mock.Anything, userID, "2026-04-22").Return(bookings, nil)
		mockCache.On("SetCache", mock.Anything, mock.Anything, mock.Anything, mock.Anything).
        Return(nil).Maybe()

		result, err := usecase.GetUserHistory(ctx, userID, "2026-04-22")

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, 1, len(result))
	})

	t.Run("Empty user history", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetUserHistoryDB", mock.Anything, userID, "2026-04-22").Return([]domain.Booking{}, nil)
		mockCache.On("SetCache", mock.Anything, mock.Anything, mock.Anything, mock.Anything).
        Return(nil).Maybe()

		result, err := usecase.GetUserHistory(ctx, userID, "2026-04-22")

		assert.NoError(t, err)
		assert.Empty(t, result)
	})

	t.Run("Database error retrieving user history", func(t *testing.T) {
		mockDB := new(mocks.BookingPostgresRepo)
		mockCache := new(mocks.BookingRedisRepo)
		mockPublisher := new(mocks.RealtimePublisher)
		mockAsync := new(mocks.AsynqQueue)

		usecase := NewBookingUsecases(mockPublisher, mockCache, mockDB, mockAsync)

		userID := uuid.New()

		mockCache.On("GetCache", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("cache miss"))
		mockDB.On("GetUserHistoryDB", mock.Anything, userID, "2026-04-22").Return(nil, errors.New("history not found"))

		result, err := usecase.GetUserHistory(ctx, userID, "2026-04-22")

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// Helper function to create string pointer
func stringPtr(s string) *string {
	return &s
}
