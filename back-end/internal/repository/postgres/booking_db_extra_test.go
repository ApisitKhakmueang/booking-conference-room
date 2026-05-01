package postgresRepo

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestGetUserBookingDB(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	roomID := uuid.New()
	bookingID := uuid.New()

	t.Run("Get user bookings successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND user_id = $3 AND status = 'confirm' ORDER BY start_time asc`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, room_number FROM "rooms" WHERE "rooms"."id" = $1`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "room_number"}).AddRow(roomID, "Room A", 101))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, email, full_name FROM "users" WHERE "users"."id" = $1`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "full_name"}).AddRow(userID, "test@test.com", "Test User"))

		result, err := repo.GetUserBookingDB(ctx, userID, "2026-05")

		assert.NoError(t, err)
		assert.Len(t, result, 1)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Invalid date format", func(t *testing.T) {
		repo, _ := setupMockDB(t)
		result, err := repo.GetUserBookingDB(ctx, userID, "invalid-date")
		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestGetUserHistoryDB(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	roomID := uuid.New()
	bookingID := uuid.New()

	t.Run("Get user history successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND user_id = $3 AND status != 'confirm' ORDER BY start_time asc`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, room_number FROM "rooms" WHERE "rooms"."id" = $1`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "room_number"}).AddRow(roomID, "Room A", 101))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, email, full_name FROM "users" WHERE "users"."id" = $1`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "full_name"}).AddRow(userID, "test@test.com", "Test User"))

		result, err := repo.GetUserHistoryDB(ctx, userID, "2026-05")

		assert.NoError(t, err)
		assert.Len(t, result, 1)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Invalid date format", func(t *testing.T) {
		repo, _ := setupMockDB(t)
		result, err := repo.GetUserHistoryDB(ctx, userID, "bad-date")
		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestUpdateBookingStatusDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()

	t.Run("Update status successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(nil, "complete", sqlmock.AnyArg(), bookingID, "confirm").
			WillReturnRows(sqlmock.NewRows([]string{"id", "status"}).AddRow(bookingID, "complete"))
		mock.ExpectCommit()

		result, err := repo.UpdateBookingStatusDB(ctx, bookingID, "complete")

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "complete", *result.Status)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("No rows affected - not found or not confirm", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(nil, "complete", sqlmock.AnyArg(), bookingID, "confirm").
			WillReturnRows(sqlmock.NewRows([]string{"id", "status"}))
		mock.ExpectCommit()

		result, err := repo.UpdateBookingStatusDB(ctx, bookingID, "complete")

		assert.Error(t, err)
		assert.Equal(t, "booking not found or status is not 'confirm'", err.Error())
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WillReturnError(gorm.ErrInvalidDB)
		mock.ExpectRollback()

		result, err := repo.UpdateBookingStatusDB(ctx, bookingID, "complete")

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetConfigDB(t *testing.T) {
	ctx := context.Background()

	t.Run("Get config successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "configs" ORDER BY "configs"."id" LIMIT $1`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "start_time", "end_time", "max_advance_days", "max_booking_mins", "no_show_threshold_mins"}).
				AddRow(1, "08:00", "20:00", 30, 120, 15))

		result, err := repo.GetConfigDB(ctx)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "08:00", result.StartTime)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Config not found", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "configs" ORDER BY "configs"."id" LIMIT $1`)).
			WithArgs(1).
			WillReturnError(gorm.ErrRecordNotFound)

		result, err := repo.GetConfigDB(ctx)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestIsRoomAvailable(t *testing.T) {
	ctx := context.Background()
	roomID := uuid.New()
	start := time.Now()
	end := start.Add(time.Hour)

	t.Run("Room is available", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{RoomID: roomID, StartTime: &start, EndTime: &end}

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "bookings" WHERE room_id = $1 AND status = $2 AND (start_time < $3 AND end_time > $4)`)).
			WithArgs(roomID, "confirm", end, start).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "rooms" WHERE id = $1 AND status = $2`)).
			WithArgs(roomID, "available").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		available := repo.IsRoomAvailable(ctx, booking)

		assert.True(t, available)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Room not available - time overlap", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{RoomID: roomID, StartTime: &start, EndTime: &end}

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "bookings" WHERE room_id = $1 AND status = $2 AND (start_time < $3 AND end_time > $4)`)).
			WithArgs(roomID, "confirm", end, start).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		available := repo.IsRoomAvailable(ctx, booking)

		assert.False(t, available)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Room not available - not available status", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{RoomID: roomID, StartTime: &start, EndTime: &end}

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "bookings" WHERE room_id = $1 AND status = $2 AND (start_time < $3 AND end_time > $4)`)).
			WithArgs(roomID, "confirm", end, start).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "rooms" WHERE id = $1 AND status = $2`)).
			WithArgs(roomID, "available").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		available := repo.IsRoomAvailable(ctx, booking)

		assert.False(t, available)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestIsPasscodeAvailable(t *testing.T) {
	ctx := context.Background()
	passcode := "1234"

	t.Run("Passcode is available", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "bookings" WHERE passcode = $1 AND status = $2`)).
			WithArgs(passcode, "confirm").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		available := repo.IsPasscodeAvailable(ctx, &domain.Booking{}, passcode)

		assert.True(t, available)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Passcode already in use", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "bookings" WHERE passcode = $1 AND status = $2`)).
			WithArgs(passcode, "confirm").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		available := repo.IsPasscodeAvailable(ctx, &domain.Booking{}, passcode)

		assert.False(t, available)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetBookingByID(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()
	roomID := uuid.New()

	t.Run("Get booking by ID successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE "bookings"."id" = $1 ORDER BY "bookings"."id" LIMIT $2`)).
			WithArgs(bookingID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "rooms" WHERE "rooms"."id" = $1 AND "rooms"."deleted_at" IS NULL`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(roomID, "Room A"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 AND "users"."deleted_at" IS NULL`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "full_name"}).AddRow(userID, "John Doe"))

		result, err := repo.GetBookingByID(ctx, bookingID)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, bookingID, result.ID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Booking not found", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE "bookings"."id" = $1 ORDER BY "bookings"."id" LIMIT $2`)).
			WithArgs(bookingID, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		result, err := repo.GetBookingByID(ctx, bookingID)

		assert.Error(t, err)
		assert.NotNil(t, result) // GORM returns empty struct pointer, not nil
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetRoomID(t *testing.T) {
	ctx := context.Background()
	roomNumber := uint(101)
	roomID := uuid.New()

	t.Run("Get room ID successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{}

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT "id" FROM "rooms" WHERE room_number = $1`)).
			WithArgs(roomNumber).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(roomID))

		err := repo.GetRoomID(ctx, booking, roomNumber)

		assert.NoError(t, err)
		assert.Equal(t, roomID, booking.RoomID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{}

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT "id" FROM "rooms" WHERE room_number = $1`)).
			WithArgs(roomNumber).
			WillReturnError(gorm.ErrInvalidDB)

		err := repo.GetRoomID(ctx, booking, roomNumber)

		assert.Error(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestCheckDayOff(t *testing.T) {
	ctx := context.Background()

	t.Run("Weekend - Saturday", func(t *testing.T) {
		repo, _ := setupMockDB(t)
		date := time.Date(2026, 5, 2, 10, 0, 0, 0, time.UTC) // Saturday
		err := repo.CheckDayOff(ctx, date)
		assert.Error(t, err)
		assert.Equal(t, "Can't to book in day off", err.Error())
	})

	t.Run("Weekend - Sunday", func(t *testing.T) {
		repo, _ := setupMockDB(t)
		date := time.Date(2026, 5, 3, 10, 0, 0, 0, time.UTC) // Sunday
		err := repo.CheckDayOff(ctx, date)
		assert.Error(t, err)
	})

	t.Run("Holiday from database", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		date := time.Date(2026, 5, 4, 10, 0, 0, 0, time.UTC) // Monday

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "holidays" WHERE date = $1 AND is_day_off = TRUE ORDER BY "holidays"."id" LIMIT $2`)).
			WithArgs("2026-05-04", 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Labor Day"))

		err := repo.CheckDayOff(ctx, date)

		assert.Error(t, err)
		assert.Equal(t, "Can't to book in day off", err.Error())
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Normal working day", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		date := time.Date(2026, 5, 4, 10, 0, 0, 0, time.UTC) // Monday

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "holidays" WHERE date = $1 AND is_day_off = TRUE ORDER BY "holidays"."id" LIMIT $2`)).
			WithArgs("2026-05-04", 1).
			WillReturnError(gorm.ErrRecordNotFound)

		err := repo.CheckDayOff(ctx, date)

		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetRoomDB(t *testing.T) {
	ctx := context.Background()

	t.Run("Get all rooms successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, capacity, status, room_number, location FROM "rooms" WHERE deleted_at IS NULL`)).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "capacity", "status", "room_number", "location"}).
				AddRow(uuid.New(), "Room A", 10, "available", 101, "Floor 1").
				AddRow(uuid.New(), "Room B", 20, "available", 102, "Floor 2"))

		result, err := repo.GetRoomDB(ctx)

		assert.NoError(t, err)
		assert.Len(t, result, 2)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, capacity, status, room_number, location FROM "rooms" WHERE deleted_at IS NULL`)).
			WillReturnError(gorm.ErrInvalidDB)

		result, err := repo.GetRoomDB(ctx)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetRoomNumberDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	roomID := uuid.New()

	t.Run("Get room number successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(`SELECT .+ FROM "bookings" WHERE "bookings"."id" = .+ ORDER BY "bookings"."id" LIMIT .+`).
			WithArgs(bookingID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "room_id"}).AddRow(bookingID, roomID))

		mock.ExpectQuery(`SELECT .+ FROM "rooms" WHERE "rooms"."id" = .+`).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "room_number"}).AddRow(roomID, 101))

		result, err := repo.GetRoomNumberDB(ctx, bookingID)

		assert.NoError(t, err)
		assert.Equal(t, uint(101), result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Booking not found", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(`SELECT .+ FROM "bookings" WHERE "bookings"."id" = .+ ORDER BY "bookings"."id" LIMIT .+`).
			WithArgs(bookingID, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		result, err := repo.GetRoomNumberDB(ctx, bookingID)

		assert.Error(t, err)
		assert.Equal(t, uint(0), result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}
