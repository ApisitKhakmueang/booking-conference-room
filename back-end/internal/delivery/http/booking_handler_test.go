package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/mocks"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func setupTestApp(mockService *mocks.BookingUsecases) (*fiber.App, *BookingHandlers) {
	handler := NewBookingHandlers(mockService)
	mockUserID := "550e8400-e29b-41d4-a716-446655440000"

	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("user_id", mockUserID)
		return c.Next()
	})

	InitialBookingRoute(app, handler)
	return app, handler
}

func TestCreateBooking(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")

	t.Run("Successful booking creation", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 14, 40, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 40, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Business conference",
		}

		body, _ := json.Marshal(booking)
		mockService.On("CreateBooking", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(101)).Return(nil)

		req := httptest.NewRequest("POST", "/room/101", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)
	})

	t.Run("Invalid room number", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 14, 40, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 40, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Business conference",
		}

		body, _ := json.Marshal(booking)

		req := httptest.NewRequest("POST", "/room/invalid", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Invalid request body", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		body := []byte("invalid json")

		req := httptest.NewRequest("POST", "/room/101", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 14, 40, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 40, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Business conference",
		}

		body, _ := json.Marshal(booking)
		mockService.On("CreateBooking", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(101)).Return(errors.New("room not available"))

		req := httptest.NewRequest("POST", "/room/101", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestUpdateBooking(t *testing.T) {
	location, _ := time.LoadLocation("Asia/Bangkok")
	bookingID := "650e8400-e29b-41d4-a716-446655440000"

	t.Run("Successful booking update", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 17, 0, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Updated conference",
		}

		body, _ := json.Marshal(booking)
		mockService.On("UpdateBooking", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(102)).Return(nil)

		req := httptest.NewRequest("PUT", "/"+bookingID+"/room/102", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Invalid booking ID", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 17, 0, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		body, _ := json.Marshal(booking)

		req := httptest.NewRequest("PUT", "/invalid-id/room/102", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Invalid room number", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 17, 0, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		body, _ := json.Marshal(booking)

		req := httptest.NewRequest("PUT", "/"+bookingID+"/room/invalid", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Room number is zero", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 17, 0, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		body, _ := json.Marshal(booking)

		req := httptest.NewRequest("PUT", "/"+bookingID+"/room/0", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Room number is negative", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 17, 0, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		body, _ := json.Marshal(booking)

		req := httptest.NewRequest("PUT", "/"+bookingID+"/room/-1", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Invalid request body", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		body := []byte("invalid json")

		req := httptest.NewRequest("PUT", "/"+bookingID+"/room/102", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		startTime := time.Date(2026, time.April, 22, 16, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 17, 0, 0, 0, location)

		booking := domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
		}

		body, _ := json.Marshal(booking)
		mockService.On("UpdateBooking", mock.Anything, mock.AnythingOfType("*domain.Booking"), uint(102)).Return(errors.New("booking not found"))

		req := httptest.NewRequest("PUT", "/"+bookingID+"/room/102", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestDeleteBooking(t *testing.T) {
	bookingID := "750e8400-e29b-41d4-a716-446655440000"

	t.Run("Successful booking deletion", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("DeleteBooking", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(nil)

		req := httptest.NewRequest("DELETE", "/"+bookingID, nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Invalid booking ID", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		req := httptest.NewRequest("DELETE", "/invalid-id", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("DeleteBooking", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(errors.New("booking already deleted"))

		req := httptest.NewRequest("DELETE", "/"+bookingID, nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestCheckOutBooking(t *testing.T) {
	bookingID := "850e8400-e29b-41d4-a716-446655440000"

	t.Run("Successful checkout", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("CheckOutBooking", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(nil)

		req := httptest.NewRequest("PATCH", "/"+bookingID+"/checkout", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Invalid booking ID", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		req := httptest.NewRequest("PATCH", "/invalid-id/checkout", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("CheckOutBooking", mock.Anything, mock.AnythingOfType("*domain.Booking")).Return(errors.New("checkout failed"))

		req := httptest.NewRequest("PATCH", "/"+bookingID+"/checkout", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestCheckInBooking(t *testing.T) {
	roomID := uuid.New()

	t.Run("Successful check-in", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		handler := NewBookingHandlers(mockService)
		app := fiber.New()

		// ⭐️ ประกาศ Route ให้ตรงตามที่นิยามไว้ใน InitialHelperRoute
		// แม้ในแอปจริงจะอยู่ในฟังก์ชันอื่น แต่ในเทสเราจำลองขึ้นมาเองได้
		app.Post("/room/:roomID/checkin", handler.CheckInBooking)

		mockService.On("CheckInBooking", mock.Anything, roomID, "1234").Return(nil)
		
		req := httptest.NewRequest("POST", "/room/"+roomID.String()+"/checkin", 
			bytes.NewBuffer([]byte(`{"passcode":"1234"}`)))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Invalid room ID", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		handler := NewBookingHandlers(mockService)
		app := fiber.New()

		// ⭐️ ประกาศ Route ให้ตรงตามที่นิยามไว้ใน InitialHelperRoute
		// แม้ในแอปจริงจะอยู่ในฟังก์ชันอื่น แต่ในเทสเราจำลองขึ้นมาเองได้
		app.Post("/room/:roomID/checkin", handler.CheckInBooking)

		req := httptest.NewRequest("POST", "/room/invalid-id/checkin",
			bytes.NewBuffer([]byte(`{"passcode":"1234"}`)))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Missing passcode in request body", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		handler := NewBookingHandlers(mockService)
		app := fiber.New()

		// ⭐️ ประกาศ Route ให้ตรงตามที่นิยามไว้ใน InitialHelperRoute
		// แม้ในแอปจริงจะอยู่ในฟังก์ชันอื่น แต่ในเทสเราจำลองขึ้นมาเองได้
		app.Post("/room/:roomID/checkin", handler.CheckInBooking)

		req := httptest.NewRequest("POST", "/room/"+roomID.String()+"/checkin",
			bytes.NewBuffer([]byte(`{}`)))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Empty passcode", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		handler := NewBookingHandlers(mockService)
		app := fiber.New()

		// ⭐️ ประกาศ Route ให้ตรงตามที่นิยามไว้ใน InitialHelperRoute
		// แม้ในแอปจริงจะอยู่ในฟังก์ชันอื่น แต่ในเทสเราจำลองขึ้นมาเองได้
		app.Post("/room/:roomID/checkin", handler.CheckInBooking)

		req := httptest.NewRequest("POST", "/room/"+roomID.String()+"/checkin",
			bytes.NewBuffer([]byte(`{"passcode":""}`)))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Invalid request body format", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		handler := NewBookingHandlers(mockService)
		app := fiber.New()

		// ⭐️ ประกาศ Route ให้ตรงตามที่นิยามไว้ใน InitialHelperRoute
		// แม้ในแอปจริงจะอยู่ในฟังก์ชันอื่น แต่ในเทสเราจำลองขึ้นมาเองได้
		app.Post("/room/:roomID/checkin", handler.CheckInBooking)

		req := httptest.NewRequest("POST", "/room/"+roomID.String()+"/checkin",
			bytes.NewBuffer([]byte(`invalid json`)))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		handler := NewBookingHandlers(mockService)
		app := fiber.New()

		// ⭐️ ประกาศ Route ให้ตรงตามที่นิยามไว้ใน InitialHelperRoute
		// แม้ในแอปจริงจะอยู่ในฟังก์ชันอื่น แต่ในเทสเราจำลองขึ้นมาเองได้
		app.Post("/room/:roomID/checkin", handler.CheckInBooking)

		mockService.On("CheckInBooking", mock.Anything, roomID, "wrong").Return(errors.New("invalid passcode"))
		
		req := httptest.NewRequest("POST", "/room/"+roomID.String()+"/checkin",
			bytes.NewBuffer([]byte(`{"passcode":"wrong"}`)))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestGetBookingByDay(t *testing.T) {
	t.Run("Successful retrieval with bookings", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		location, _ := time.LoadLocation("Asia/Bangkok")
		startTime := time.Date(2026, time.April, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				StartTime: &startTime,
				EndTime:   &endTime,
				Title:     "Meeting 1",
			},
		}

		mockService.On("GetBookingByDay", mock.Anything, "2026-04-22").Return(bookings, nil)

		req := httptest.NewRequest("GET", "/date/2026-04-22", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Empty bookings list", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetBookingByDay", mock.Anything, "2026-04-23").Return([]domain.Booking{}, nil)

		req := httptest.NewRequest("GET", "/date/2026-04-23", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetBookingByDay", mock.Anything, "2026-04-24").Return(nil, errors.New("database error"))

		req := httptest.NewRequest("GET", "/date/2026-04-24", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestGetUpNextBooking(t *testing.T) {
	t.Run("Successful retrieval with booking", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		location, _ := time.LoadLocation("Asia/Bangkok")
		startTime := time.Date(2026, time.April, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 0, 0, 0, location)

		booking := &domain.Booking{
			StartTime: &startTime,
			EndTime:   &endTime,
			Title:     "Next Meeting",
		}

		mockService.On("GetUpNextBooking", mock.Anything, "2026-04-22").Return(booking, nil)

		req := httptest.NewRequest("GET", "/up-next/2026-04-22", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("No booking found", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetUpNextBooking", mock.Anything, "2026-04-25").Return(nil, nil)

		req := httptest.NewRequest("GET", "/up-next/2026-04-25", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetUpNextBooking", mock.Anything, "2026-04-26").Return(nil, errors.New("database error"))

		req := httptest.NewRequest("GET", "/up-next/2026-04-26", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestGetAnalyticBooking(t *testing.T) {
	t.Run("Successful analytics retrieval", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		response := &domain.UpNextBookingResponse{
			AttendanceHealth: domain.AttendanceHealth{
				Completed:      15,
				Cancelled:      3,
				NoShow:         2,
				CompletionRate: 79,
				CanCelledRate:  16,
				NoShowRate:     11,
			},
			PopularRooms: []domain.PopularRoom{
				{
					ID:         uuid.New(),
					RoomNumber: 101,
					Name:       "Conference Room A",
					Percentage: 45,
				},
				{
					ID:         uuid.New(),
					RoomNumber: 102,
					Name:       "Conference Room B",
					Percentage: 35,
				},
			},
		}

		mockService.On("GetAnalyticBooking", mock.Anything, mock.AnythingOfType("*domain.Date")).Return(response, nil)

		req := httptest.NewRequest("GET", "/analytic/startDate/2026-04-01/endDate/2026-04-30", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetAnalyticBooking", mock.Anything, mock.AnythingOfType("*domain.Date")).Return(nil, errors.New("analytics error"))

		req := httptest.NewRequest("GET", "/analytic/startDate/2026-04-01/endDate/2026-04-30", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestGetUserBooking(t *testing.T) {
	t.Run("Successful user bookings retrieval", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		location, _ := time.LoadLocation("Asia/Bangkok")
		startTime := time.Date(2026, time.April, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				StartTime: &startTime,
				EndTime:   &endTime,
				Title:     "User Meeting",
			},
		}

		mockService.On("GetUserBooking", mock.Anything, mock.AnythingOfType("uuid.UUID"), "2026-04-22").Return(bookings, nil)

		req := httptest.NewRequest("GET", "/me/date/2026-04-22", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Empty user bookings list", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetUserBooking", mock.Anything, mock.AnythingOfType("uuid.UUID"), "2026-04-23").Return([]domain.Booking{}, nil)

		req := httptest.NewRequest("GET", "/me/date/2026-04-23", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetUserBooking", mock.Anything, mock.AnythingOfType("uuid.UUID"), "2026-04-24").Return(nil, errors.New("user not found"))

		req := httptest.NewRequest("GET", "/me/date/2026-04-24", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

func TestGetUserHistory(t *testing.T) {
	t.Run("Successful user history retrieval", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		location, _ := time.LoadLocation("Asia/Bangkok")
		startTime := time.Date(2026, time.April, 22, 14, 0, 0, 0, location)
		endTime := time.Date(2026, time.April, 22, 15, 0, 0, 0, location)

		bookings := []domain.Booking{
			{
				StartTime: &startTime,
				EndTime:   &endTime,
				Title:     "Past Meeting",
			},
		}

		mockService.On("GetUserHistory", mock.Anything, mock.AnythingOfType("uuid.UUID"), "2026-04-22").Return(bookings, nil)

		req := httptest.NewRequest("GET", "/me/history/date/2026-04-22", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Empty history list", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetUserHistory", mock.Anything, mock.AnythingOfType("uuid.UUID"), "2026-04-25").Return([]domain.Booking{}, nil)

		req := httptest.NewRequest("GET", "/me/history/date/2026-04-25", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
	})

	t.Run("Usecase returns error", func(t *testing.T) {
		mockService := new(mocks.BookingUsecases)
		app, _ := setupTestApp(mockService)

		mockService.On("GetUserHistory", mock.Anything, mock.AnythingOfType("uuid.UUID"), "2026-04-26").Return(nil, errors.New("history fetch failed"))

		req := httptest.NewRequest("GET", "/me/history/date/2026-04-26", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

