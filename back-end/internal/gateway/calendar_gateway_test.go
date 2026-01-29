package gateway

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	// "time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/stretchr/testify/assert"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

// helper function เพื่อสร้าง Mock Calendar Service
func setupMockCalendarService(handler http.Handler) *calendar.Service {
	server := httptest.NewServer(handler)
	
	// สร้าง Client ที่ยิงไปหา Mock Server แทน Google
	svc, _ := calendar.NewService(context.Background(),
		option.WithEndpoint(server.URL),
		option.WithoutAuthentication(),
		option.WithHTTPClient(server.Client()),
	)
	return svc
}

func TestParseTime(t *testing.T) {
	// Test นี้ไม่ต้อง Mock HTTP เพราะเป็น Logic ภายใน
	gw := &googleCalendarGateway{}

	booking := &domain.Booking{
		StartTime: "2023-10-27 09:00:00",
		EndTime:   "2023-10-27 10:00:00",
	}

	times, err := gw.ParseTime(booking)

	assert.NoError(t, err)
	assert.Len(t, times, 2)
	// เช็คว่าแปลงเป็น RFC3339 และใส่ Zone ICT ถูกต้องไหม
	assert.Contains(t, times[0], "2023-10-27T09:00:00+07:00")
	assert.Contains(t, times[1], "2023-10-27T10:00:00+07:00")
}

func TestIsRoomAvailable(t *testing.T) {
	t.Run("Room Available", func(t *testing.T) {
		// จำลอง Response จาก Google FreeBusy
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// เช็คว่าเป็น FreeBusy Request
			if strings.Contains(r.URL.Path, "freeBusy") {
				w.WriteHeader(http.StatusOK)
				// ส่ง JSON กลับมาว่า busy = empty (ว่าง)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"calendars": map[string]interface{}{
						"room-123": map[string]interface{}{
							"busy": []interface{}{},
						},
					},
				})
			}
		})

		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		CalendarID := "room-123"
		Time := []string{
			"2023-10-27T09:00:00Z",
			"2023-10-27T10:00:00Z",
		}

		err := gw.IsRoomAvailable(CalendarID, Time)
		assert.NoError(t, err)
	})

	t.Run("Room Busy", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.Contains(r.URL.Path, "freeBusy") {
				w.WriteHeader(http.StatusOK)
				// ส่ง JSON กลับมาว่ามีรายการ busy
				json.NewEncoder(w).Encode(map[string]interface{}{
					"calendars": map[string]interface{}{
						"room-123": map[string]interface{}{
							"busy": []interface{}{
								map[string]string{"start": "...", "end": "..."},
							},
						},
					},
				})
			}
		})

		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		CalendarID := "room-123"
		Time := []string{
			"",
			"",
		}
		err := gw.IsRoomAvailable(CalendarID, Time)
		
		assert.Error(t, err)
		assert.Equal(t, "This time unavailable", err.Error())
	})
}

func TestCreateEvent(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. ดักจับ FreeBusy (ต้องว่าง)
			if strings.Contains(r.URL.Path, "freeBusy") {
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"calendars": map[string]interface{}{
						"room-123": map[string]interface{}{
							"busy": []interface{}{},
						},
					},
				})
				return
			}

			// 2. ดักจับ Insert Event
			if r.Method == "POST" && strings.Contains(r.URL.Path, "/events") {
				w.WriteHeader(http.StatusOK)
				// คืนค่า Event ID ที่สร้างเสร็จ
				json.NewEncoder(w).Encode(map[string]string{
					"id": "new-google-event-id",
				})
				return
			}
		})

		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		booking := &domain.Booking{
			CalendarID: "room-123",
			StartTime:  "2023-10-27 09:00:00", // Format ให้ตรงกับ ParseTime
			EndTime:    "2023-10-27 10:00:00",
		}
		filter := &domain.SearchFilter{
			Room:  1,
			Email: "test@example.com",
		}

		eventID, err := gw.CreateEvent(booking, filter)

		assert.NoError(t, err)
		assert.Equal(t, "new-google-event-id", eventID)
	})
}

func TestUpdateEvent(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		// Mock Handler
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. ดักจับ FreeBusy (ตรวจสอบว่าห้องว่างก่อนอัปเดต)
			if strings.Contains(r.URL.Path, "freeBusy") {
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"calendars": map[string]interface{}{
						"room-123": map[string]interface{}{
							"busy": []interface{}{}, // ส่ง array ว่าง = ว่าง
						},
					},
				})
				return
			}

			// 2. ดักจับ PATCH Request (สำหรับการ Update Event)
			// ตรวจสอบทั้ง Method PATCH และ URL ที่มี Event ID
			if r.Method == "PATCH" && strings.Contains(r.URL.Path, "/events/google-event-id-999") {
				w.WriteHeader(http.StatusOK)
				// คืนค่า Event Object กลับไป (Google API มักจะคืนตัวที่อัปเดตแล้วกลับมา)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"id":      "google-event-id-999",
					"summary": "Updated Summary",
				})
				return
			}

			// กรณีไม่ตรงเงื่อนไข
			w.WriteHeader(http.StatusBadRequest)
		})

		// Setup Service
		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		// Prepare Data
		booking := &domain.Booking{
			CalendarID:    "room-123",
			GoogleEventID: "google-event-id-999", // ID ของ Event ที่จะแก้
			StartTime:     "2023-12-01 13:00:00",
			EndTime:       "2023-12-01 14:00:00",
		}
		filter := &domain.SearchFilter{
			Room:  2,
			Email: "update@test.com",
		}

		// Execute
		err := gw.UpdateEvent(booking, filter)

		// Assert
		assert.NoError(t, err)
	})

	t.Run("Fail - Room Not Available", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Mock ว่าห้องไม่ว่าง (มี Busy slot)
			if strings.Contains(r.URL.Path, "freeBusy") {
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"calendars": map[string]interface{}{
						"room-123": map[string]interface{}{
							"busy": []interface{}{
								map[string]string{"start": "...", "end": "..."},
							},
						},
					},
				})
				return
			}
		})

		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		booking := &domain.Booking{
			CalendarID:    "room-123",
			GoogleEventID: "google-event-id-999",
			StartTime:     "2023-12-01 13:00:00",
			EndTime:       "2023-12-01 14:00:00",
		}

		err := gw.UpdateEvent(booking, &domain.SearchFilter{})

		// ต้อง Error เพราะห้องไม่ว่าง
		assert.Error(t, err)
		assert.Equal(t, "This time unavailable", err.Error())
	})

	t.Run("Fail - Google API Error during Patch", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. FreeBusy ผ่าน
			if strings.Contains(r.URL.Path, "freeBusy") {
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"calendars": map[string]interface{}{
						"room-123": map[string]interface{}{"busy": []interface{}{}},
					},
				})
				return
			}

			// 2. Patch พัง (เช่น Event ID ผิด หรือ Server Error)
			if r.Method == "PATCH" {
				w.WriteHeader(http.StatusInternalServerError) // 500
				return
			}
		})

		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		booking := &domain.Booking{
			CalendarID:    "room-123",
			GoogleEventID: "google-event-id-999",
			StartTime:     "2023-12-01 13:00:00",
			EndTime:       "2023-12-01 14:00:00",
		}

		err := gw.UpdateEvent(booking, &domain.SearchFilter{})

		// ต้อง Error เพราะ Google API ตอบ 500
		assert.Error(t, err)
	})
}

func TestCancelEvent(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// ดักจับ Delete Method
			if r.Method == "DELETE" && strings.Contains(r.URL.Path, "/events/event-id-123") {
				w.WriteHeader(http.StatusNoContent) // 204
				return
			}
			w.WriteHeader(http.StatusNotFound)
		})

		svc := setupMockCalendarService(handler)
		gw := NewGoogleCalendarGateway(svc)

		err := gw.CancelEvent("room-123", "event-id-123")
		assert.NoError(t, err)
	})
}