package http

import (
	"bytes"
	"encoding/json"
	// "errors"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/stretchr/testify/mock"
)

type MockOrderUsecase struct {
	mock.Mock
}

func (m *MockOrderUsecase) CreateBooking(booking *domain.Booking, filter *domain.SearchFilter) error {
	args := m.Called(booking, filter)
	return args.Error(0)
}

func TestCreateBooking(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		// Setup
		app := fiber.New()
		mockUsecase := new(MockOrderUsecase)
		handler := NewOrderHandler(mockUsecase)
		
		userID := uuid.New()
		app.Post("/api/booking/:id", handler.CreateBooking)

		// กำหนดพฤติกรรม Mock
		mockUsecase.On("CreateBooking", mock.AnythingOfType("*domain.Booking"), mock.AnythingOfType("*domain.SearchFilter")).
			Return(nil)

		// สร้าง Request Body
		body := domain.Booking{ 
			StartTime: "2026-01-30 09:00:00",
    	EndTime: "2026-01-30 10:00:00",
		}
		jsonBody, _ := json.Marshal(body)
		
		// สร้าง Request พร้อม Query Params (ตามที่โค้ดคุณต้องการ filter.Email และ Room)
		req := httptest.NewRequest("POST", "/api/booking/"+userID.String()+"?email=test@test.com&room=101", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		// ทดสอบ
		resp, _ := app.Test(req)

		// ตรวจสอบผลลัพธ์
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
		mockUsecase.AssertExpectations(t)
	})

	t.Run("error_bad_id", func(t *testing.T) {
		app := fiber.New()
		handler := NewOrderHandler(nil) // ไม่ต้องใช้ usecase ในเคสนี้
		app.Post("/api/booking/:id", handler.CreateBooking)

		req := httptest.NewRequest("POST", "/api/booking/not-a-uuid", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)
	})
}

