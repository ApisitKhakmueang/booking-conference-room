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
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupMockDB(t *testing.T) (domain.BookingPostgresRepo, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm: %s", err)
	}

	return NewBookingPostgresRepo(gormDB), mock
}

func TestCreateBookingDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()
	roomID := uuid.New()

	t.Run("Successful creation with relations", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		// 1. Mock INSERT (เหมือนเดิม)
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "bookings"`)).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(bookingID))
		mock.ExpectCommit()

		// 2. Mock SELECT หลัก (ตาราง bookings)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE "bookings"."id" = $1 ORDER BY "bookings"."id" LIMIT $2`)).
			WithArgs(bookingID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		// 3. Mock SELECT สำหรับ Preload Room (ดึงข้อมูลห้อง)
		// สังเกต SQL จาก Error ของคุณ หรือใช้ regexp.QuoteMeta ครอบคำสั่ง SELECT rooms
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, room_number FROM "rooms" WHERE "rooms"."id" = $1`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "room_number"}).AddRow(roomID, "Conference Room A", 101))

		// 4. Mock SELECT สำหรับ Preload User (ดึงข้อมูลผู้ใช้ - ตามที่ Error แจ้ง)[cite: 9]
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, email, full_name FROM "users" WHERE "users"."id" = $1 AND "users"."deleted_at" IS NULL`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "full_name"}).AddRow(userID, "test@email.com", "John Doe"))

		// --- รันฟังก์ชัน ---
		result, err := repo.CreateBookingDB(ctx, &domain.Booking{ID: bookingID})

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet()) // สำคัญมาก เพื่อเช็คว่าเรียกครบทุก Query
	})

	t.Run("Database error on Create", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{ID: bookingID}

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "bookings"`)).
			WillReturnError(gorm.ErrInvalidDB)
		mock.ExpectRollback()

		result, err := repo.CreateBookingDB(ctx, booking)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUpdateBookingDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()
	roomID := uuid.New()
	start := time.Now()
	end := start.Add(time.Hour * 2)

	t.Run("Successful booking update with relations", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		booking := &domain.Booking{
			ID:        bookingID,
			UserID:    userID,
			StartTime: &start,
			EndTime:   &end,
			Title:     "Updated Meeting Title",
		}

		// 1. Mock UPDATE (เนื่องจากมี Returning{} จึงต้องใช้ ExpectQuery แทน ExpectExec)[cite: 9, 11]
		// GORM จะสร้าง SQL ในรูปแบบ UPDATE ... SET ... WHERE ... RETURNING *
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(
				sqlmock.AnyArg(),  // UpdatedAt (GORM จัดการให้อัตโนมัติ)
				booking.StartTime, // ข้อมูลที่เปลี่ยน
				booking.EndTime,
				booking.Title, // ข้อมูลที่เปลี่ยน
				userID,        // WHERE user_id = ?
				bookingID,     // WHERE id = ?
			).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(bookingID))
		mock.ExpectCommit()

		// 2. Mock SELECT หลัก (ตาราง bookings) หลังการ Update
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE "bookings"."id" = $1 ORDER BY "bookings"."id" LIMIT $2`)).
			WithArgs(bookingID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		// 3. Mock SELECT สำหรับ Preload Room (ดึงข้อมูลห้อง)[cite: 11]
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, room_number FROM "rooms" WHERE "rooms"."id" = $1`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "room_number"}).AddRow(roomID, "Conference Room B", 102))

		// 4. Mock SELECT สำหรับ Preload User (ดึงข้อมูลคนจอง)[cite: 11]
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, email, full_name FROM "users" WHERE "users"."id" = $1`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "full_name"}).AddRow(userID, "user@example.com", "Test User"))

		// --- รันฟังก์ชัน ---
		result, err := repo.UpdateBookingDB(ctx, booking)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, booking.Title, result.Title)
		assert.NoError(t, mock.ExpectationsWereMet()) // ยืนยันว่า SQL ทุกคำสั่งถูกเรียกจริง
	})

	t.Run("Database error on Update", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{
			ID:        bookingID,
			UserID:    userID,
			StartTime: &start,
			EndTime:   &end,
			Title:     "Updated Meeting Title",
		}

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(
				sqlmock.AnyArg(),  // UpdatedAt (GORM จัดการให้อัตโนมัติ)
				booking.StartTime, // ข้อมูลที่เปลี่ยน
				booking.EndTime,
				booking.Title, // ข้อมูลที่เปลี่ยน
				userID,        // WHERE user_id = ?
				bookingID,     // WHERE id = ?
			).
			WillReturnError(gorm.ErrInvalidDB)
		mock.ExpectRollback()

		result, err := repo.UpdateBookingDB(ctx, booking)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestDeleteBookingDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()

	t.Run("Successful delete/cancel booking", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		booking := &domain.Booking{
			ID:     bookingID,
			UserID: userID,
		}

		mock.ExpectBegin()
		// ⭐️ ใช้ ExpectQuery เพราะมี Returning{}
		// และใช้ AnyArg() สำหรับ updated_at และค่า now ในเงื่อนไข Where
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(
				nil,              // $3: passcode (SET)
				"cancelled",      // $2: status (SET)
				sqlmock.AnyArg(), // $1: updated_at (SET)
				bookingID,        // $4: id (WHERE)
				"confirm",        // $5: status (WHERE)
				userID,           // $6: user_id (WHERE)
				sqlmock.AnyArg(), // $7: start_time > ? (ค่า now ในโค้ด)[cite: 2, 3]
			).
			WillReturnRows(sqlmock.NewRows([]string{"id", "status"}).
				AddRow(bookingID, "cancelled"))
		mock.ExpectCommit()

		result, err := repo.DeleteBookingDB(ctx, booking)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "cancelled", *result.Status)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Failed to cancel - Rows affected is 0", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{ID: bookingID, UserID: userID}

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(nil, "cancelled", sqlmock.AnyArg(), booking.ID, "confirm", booking.UserID, sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id"}))
		mock.ExpectCommit()

		result, err := repo.DeleteBookingDB(ctx, booking)

		assert.Error(t, err)
		assert.Equal(t, "cannot cancel: booking already started, checked in, or not found", err.Error())
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Failed to database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		booking := &domain.Booking{ID: bookingID, UserID: userID}

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(nil, "cancelled", sqlmock.AnyArg(), booking.ID, "confirm", booking.UserID, sqlmock.AnyArg()).
			WillReturnError(gorm.ErrInvalidDB)
		mock.ExpectRollback()

		result, err := repo.DeleteBookingDB(ctx, booking)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestCheckOutBookingDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()
	now := time.Now()

	t.Run("Chceck out successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		booking := domain.Booking{
			ID:     bookingID,
			UserID: userID,
		}

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(sqlmock.AnyArg(), nil, "complete", sqlmock.AnyArg(), bookingID, userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "status", "end_time", "passcode"}).AddRow(bookingID, "complete", now, nil))
		mock.ExpectCommit()

		result, err := repo.CheckOutBookingDB(ctx, &booking)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "complete", *result.Status)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Chceck out failed", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		booking := domain.Booking{
			ID:     bookingID,
			UserID: userID,
		}

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(sqlmock.AnyArg(), nil, "complete", sqlmock.AnyArg(), bookingID, userID).
			WillReturnError(gorm.ErrInvalidDB)
		mock.ExpectRollback()

		_, err := repo.CheckOutBookingDB(ctx, &booking)

		assert.Error(t, err)
		assert.Equal(t, gorm.ErrInvalidDB, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestCheckInBooking(t *testing.T) {
	ctx := context.Background()
	roomID := uuid.New()
	passcode := "1234"

	t.Run("Successful delete/cancel booking", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectBegin()
		// Mock สำหรับ CheckInBooking
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(
				sqlmock.AnyArg(), // $1: checked_in_at (ค่า now ใน SET)
				sqlmock.AnyArg(), // $2: updated_at (GORM ใส่ให้อัตโนมัติใน SET)
				roomID,           // $3: room_id (WHERE)
				passcode,         // $4: passcode (WHERE)
				"confirm",        // $5: status (WHERE)
				sqlmock.AnyArg(), // $6: start_time <= ? (ค่า allowEarlyCheckInTime ใน WHERE)
				sqlmock.AnyArg(), // $7: end_time > ? (ค่า now ใน WHERE)
			).
			WillReturnResult(sqlmock.NewResult(1, 1)) // จำลองว่า RowAffected = 1
		mock.ExpectCommit()

		err := repo.CheckInBooking(ctx, roomID, passcode)

		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Failed to cancel - Rows affected is 0", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(
				sqlmock.AnyArg(), // $1: checked_in_at (ค่า now ใน SET)
				sqlmock.AnyArg(), // $2: updated_at (GORM ใส่ให้อัตโนมัติใน SET)
				roomID,           // $3: room_id (WHERE)
				passcode,         // $4: passcode (WHERE)
				"confirm",        // $5: status (WHERE)
				sqlmock.AnyArg(), // $6: start_time <= ? (ค่า allowEarlyCheckInTime ใน WHERE)
				sqlmock.AnyArg(), // $7: end_time > ? (ค่า now ใน WHERE)
			).
			WillReturnResult(sqlmock.NewResult(1, 0))
		mock.ExpectCommit()

		err := repo.CheckInBooking(ctx, roomID, passcode)

		assert.Error(t, err)
		assert.Equal(t, "Wrong passcode or room, or it's not time to check in yet", err.Error())
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Failed to database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "bookings" SET`)).
			WithArgs(
				sqlmock.AnyArg(), // $1: checked_in_at (ค่า now ใน SET)
				sqlmock.AnyArg(), // $2: updated_at (GORM ใส่ให้อัตโนมัติใน SET)
				roomID,           // $3: room_id (WHERE)
				passcode,         // $4: passcode (WHERE)
				"confirm",        // $5: status (WHERE)
				sqlmock.AnyArg(), // $6: start_time <= ? (ค่า allowEarlyCheckInTime ใน WHERE)
				sqlmock.AnyArg(), // $7: end_time > ? (ค่า now ใน WHERE)
			).
			WillReturnError(gorm.ErrInvalidDB) // จำลองว่า RowAffected = 1
		mock.ExpectRollback()

		err := repo.CheckInBooking(ctx, roomID, passcode)

		assert.Error(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetBookingByDayDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()
	roomID := uuid.New()

	t.Run("Get booking successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		date := &domain.Date{
			StartStr: "2026-05-01",
			EndStr:   "2026-05-02",
		}

		// 1. Mock SELECT หลักจากตาราง bookings
		// สังเกตลำดับ Argument: $1 (Start), $2 (End), $3 (confirm)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND status = $3 ORDER BY start_time asc`)).
			WithArgs(date.StartStr, date.EndStr, "confirm").
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).
				AddRow(bookingID, userID, roomID))

			// 2. Mock Preload User
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "rooms" WHERE "rooms"."id" = $1 AND "rooms"."deleted_at" IS NULL`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(roomID, "Room 101"))

		// 3. Mock Preload Room
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 AND "users"."deleted_at" IS NULL`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "full_name"}).AddRow(userID, "John Doe"))

		bookings, err := repo.GetBookingByDayDB(ctx, date)

		assert.NoError(t, err)
		assert.NotNil(t, bookings)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Get booking failed", func(t *testing.T) {
		repo, mock := setupMockDB(t)
		date := &domain.Date{
			StartStr: "2026-05-01",
			EndStr:   "2026-05-02",
		}

		// 1. Mock SELECT หลักจากตาราง bookings
		// สังเกตลำดับ Argument: $1 (Start), $2 (End), $3 (confirm)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND status = $3 ORDER BY start_time asc`)).
			WithArgs(date.StartStr, date.EndStr, "confirm").
			WillReturnError(gorm.ErrInvalidDB)

		bookings, err := repo.GetBookingByDayDB(ctx, date)

		assert.Error(t, err)
		assert.Nil(t, bookings)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetUpNextBookingDB(t *testing.T) {
	ctx := context.Background()
	location, _ := time.LoadLocation("Asia/Bangkok")
	bookingID := uuid.New()
	userID := uuid.New()
	roomID := uuid.New()

	t.Run("Get up next booking successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		// ⭐️ 1. กำหนดค่า endOfDay ที่แน่นอนใน Test
		nowInTest := time.Now()
		endTime := nowInTest.AddDate(0, 0, 1)
		endOfDay := time.Date(endTime.Year(), endTime.Month(), endTime.Day(), 0, 0, 0, 0, location)

		// ⭐️ 2. เขียน Mock ExpectQuery
		// GORM .First() จะเติม LIMIT 1 เข้ามาใน SQL อัตโนมัติ
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND status = $3 ORDER BY start_time asc,"bookings"."id" LIMIT $4`)).
			WithArgs(
				sqlmock.AnyArg(),
				endOfDay,
				"confirm",
				1,
			).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).
				AddRow(bookingID, userID, roomID))

		// ⭐️ 3. Mock Preload (อย่าลืมลำดับและ deleted_at ตามที่พบใน Log ก่อนหน้า)
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "rooms" WHERE "rooms"."id" = $1 AND "rooms"."deleted_at" IS NULL`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(roomID, "Room 101"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 AND "users"."deleted_at" IS NULL`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "full_name"}).AddRow(userID, "John Doe"))

		// --- รันฟังก์ชันโดยส่ง endOfDay ที่เราสร้างไว้เข้าไป ---
		result, err := repo.GetUpNextBookingDB(ctx, endOfDay)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("No up next booking", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		// ⭐️ 1. กำหนดค่า endOfDay ที่แน่นอนใน Test
		nowInTest := time.Now()
		endTime := nowInTest.AddDate(0, 0, 1)
		endOfDay := time.Date(endTime.Year(), endTime.Month(), endTime.Day(), 0, 0, 0, 0, location)

		// ⭐️ 2. เขียน Mock ExpectQuery
		// GORM .First() จะเติม LIMIT 1 เข้ามาใน SQL อัตโนมัติ
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND status = $3 ORDER BY start_time asc,"bookings"."id" LIMIT $4`)).
			WithArgs(
				sqlmock.AnyArg(),
				endOfDay,
				"confirm",
				1,
			).
			WillReturnError(gorm.ErrRecordNotFound)

		// --- รันฟังก์ชันโดยส่ง endOfDay ที่เราสร้างไว้เข้าไป ---
		result, err := repo.GetUpNextBookingDB(ctx, endOfDay)

		assert.NoError(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Get up next booking failed", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		// ⭐️ 1. กำหนดค่า endOfDay ที่แน่นอนใน Test
		nowInTest := time.Now()
		endTime := nowInTest.AddDate(0, 0, 1)
		endOfDay := time.Date(endTime.Year(), endTime.Month(), endTime.Day(), 0, 0, 0, 0, location)

		// ⭐️ 2. เขียน Mock ExpectQuery
		// GORM .First() จะเติม LIMIT 1 เข้ามาใน SQL อัตโนมัติ
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND status = $3 ORDER BY start_time asc,"bookings"."id" LIMIT $4`)).
			WithArgs(
				sqlmock.AnyArg(),
				endOfDay,
				"confirm",
				1,
			).
			WillReturnError(gorm.ErrInvalidDB)

		// --- รันฟังก์ชันโดยส่ง endOfDay ที่เราสร้างไว้เข้าไป ---
		result, err := repo.GetUpNextBookingDB(ctx, endOfDay)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetBookingDB(t *testing.T) {
	ctx := context.Background()
	roomID := uuid.New()
	bookingID := uuid.New()
	userID := uuid.New()
	date := &domain.Date{StartStr: "2026-05-01", EndStr: "2026-06-01"}

	t.Run("Get bookings by room successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND room_id = $3 AND status = 'confirm' ORDER BY start_time desc`)).
			WithArgs(date.StartStr, date.EndStr, roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, room_number FROM "rooms" WHERE "rooms"."id" = $1`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "room_number"}).AddRow(roomID, "Room A", 101))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, email, full_name FROM "users" WHERE "users"."id" = $1`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "full_name"}).AddRow(userID, "test@test.com", "Test User"))

		result, err := repo.GetBookingDB(ctx, date, roomID)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 AND room_id = $3 AND status = 'confirm' ORDER BY start_time desc`)).
			WithArgs(date.StartStr, date.EndStr, roomID).
			WillReturnError(gorm.ErrInvalidDB)

		result, err := repo.GetBookingDB(ctx, date, roomID)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetAnalyticBookingDB(t *testing.T) {
	ctx := context.Background()
	roomID := uuid.New()
	bookingID := uuid.New()
	date := &domain.Date{StartStr: "2026-05-01", EndStr: "2026-06-01"}

	t.Run("Get analytic bookings successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 ORDER BY start_time desc`)).
			WithArgs(date.StartStr, date.EndStr).
			WillReturnRows(sqlmock.NewRows([]string{"id", "room_id"}).AddRow(bookingID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, room_number FROM "rooms" WHERE "rooms"."id" = $1`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name", "room_number"}).AddRow(roomID, "Room A", 101))

		result, err := repo.GetAnalyticBookingDB(ctx, date)

		assert.NoError(t, err)
		assert.Len(t, result, 1)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time >= $1 AND start_time < $2 ORDER BY start_time desc`)).
			WithArgs(date.StartStr, date.EndStr).
			WillReturnError(gorm.ErrInvalidDB)

		result, err := repo.GetAnalyticBookingDB(ctx, date)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetBookingStatusDB(t *testing.T) {
	ctx := context.Background()
	bookingID := uuid.New()
	userID := uuid.New()
	roomID := uuid.New()

	t.Run("Get current booking statuses successfully", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time <= $1 AND end_time > $2 AND status = $3`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "confirm").
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "rooms" WHERE "rooms"."id" = $1 AND "rooms"."deleted_at" IS NULL`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(roomID, "Room A"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 AND "users"."deleted_at" IS NULL`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "full_name"}).AddRow(userID, "John Doe"))

		result, err := repo.GetBookingStatusDB(ctx)

		assert.NoError(t, err)
		assert.Len(t, result, 1)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time <= $1 AND end_time > $2 AND status = $3`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "confirm").
			WillReturnError(gorm.ErrInvalidDB)

		result, err := repo.GetBookingStatusDB(ctx)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetBookingStatusByRoomID_DB(t *testing.T) {
	ctx := context.Background()
	roomID := uuid.New()
	userID := uuid.New()
	bookingID := uuid.New()

	t.Run("Room currently in use", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time <= $1 AND end_time > $2 AND status = $3 AND room_id = $4 ORDER BY "bookings"."id" LIMIT $5`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "confirm", roomID, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "room_id"}).AddRow(bookingID, userID, roomID))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "rooms" WHERE "rooms"."id" = $1 AND "rooms"."deleted_at" IS NULL`)).
			WithArgs(roomID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(roomID, "Room A"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 AND "users"."deleted_at" IS NULL`)).
			WithArgs(userID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "full_name"}).AddRow(userID, "John Doe"))

		result, err := repo.GetBookingStatusByRoomID_DB(ctx, roomID)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Room not in use - ErrRecordNotFound returns nil", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time <= $1 AND end_time > $2 AND status = $3 AND room_id = $4 ORDER BY "bookings"."id" LIMIT $5`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "confirm", roomID, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		result, err := repo.GetBookingStatusByRoomID_DB(ctx, roomID)

		assert.NoError(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		repo, mock := setupMockDB(t)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE start_time <= $1 AND end_time > $2 AND status = $3 AND room_id = $4 ORDER BY "bookings"."id" LIMIT $5`)).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "confirm", roomID, 1).
			WillReturnError(gorm.ErrInvalidDB)

		result, err := repo.GetBookingStatusByRoomID_DB(ctx, roomID)

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}
