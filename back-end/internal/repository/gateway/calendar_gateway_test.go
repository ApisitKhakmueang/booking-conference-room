package gateway

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/stretchr/testify/assert"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

// สร้่าง Mock Server เพื่อจำลองพฤติกรรมของ Google Calendar API
func setupMockCalendarService(t *testing.T, handler http.HandlerFunc) *calendar.Service {
	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)

	// สร้าง Service โดยชี้ BaseURL ไปที่ Mock Server
	svc, err := calendar.NewService(context.Background(), 
		option.WithEndpoint(server.URL),
		option.WithoutAuthentication(),
	)
	assert.NoError(t, err)
	return svc
}

func TestFetchHolidays(t *testing.T) {
	t.Run("Error - Invalid Start Date Format", func(t *testing.T) {
		repo := NewGoogleCalendarGateway(nil)
		date := &domain.Date{StartStr: "invalid-date", EndStr: "2026-01-02"} //

		holidays, err := repo.FetchHolidays(date)

		assert.Error(t, err)
		assert.Nil(t, holidays)
	})

	t.Run("Error - Google API Returns 500", func(t *testing.T) {
		svc := setupMockCalendarService(t, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError) // จำลอง API พัง
		})
		repo := NewGoogleCalendarGateway(svc)
		date := &domain.Date{StartStr: "2026-01-01", EndStr: "2026-01-02"}

		holidays, err := repo.FetchHolidays(date)

		assert.Error(t, err)
		assert.Nil(t, holidays)
	})

	t.Run("Success - Mixed Date and DateTime events", func(t *testing.T) {
		svc := setupMockCalendarService(t, func(w http.ResponseWriter, r *http.Request) {
			events := &calendar.Events{
				Items: []*calendar.Event{
					{
						Summary:     "Songkran Festival",
						Description: "Public Holiday",
						Start:       &calendar.EventDateTime{Date: "2026-04-13"}, // กรณีมี Date
					},
					{
						Summary:     "Special Event",
						Description: "Working Day",
						Start:       &calendar.EventDateTime{DateTime: "2026-05-01T09:00:00Z"}, // กรณีมี DateTime
					},
					{
						Summary: "Invalid Date Event",
						Start:   &calendar.EventDateTime{Date: "not-a-date"}, // กรณีวันที่พัง (ควรข้าม)
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(events)
		})

		repo := NewGoogleCalendarGateway(svc)
		date := &domain.Date{StartStr: "2026-01-01", EndStr: "2026-12-31"}

		holidays, err := repo.FetchHolidays(date)

		assert.NoError(t, err)
		// ควรได้ 1 รายการ เพราะ "Special Event" ไม่ถูกนับเป็นวันหยุดโดย CheckIsDayOff 
		// และ "Invalid Date Event" ถูก Skip ไป
		assert.GreaterOrEqual(t, len(holidays), 1) 
		assert.Equal(t, "google_calendar", holidays[0].Source) //
	})

	t.Run("Success - Empty Events", func(t *testing.T) {
		svc := setupMockCalendarService(t, func(w http.ResponseWriter, r *http.Request) {
			json.NewEncoder(w).Encode(&calendar.Events{Items: []*calendar.Event{}})
		})
		repo := NewGoogleCalendarGateway(svc)
		date := &domain.Date{StartStr: "2026-01-01", EndStr: "2026-01-02"}

		holidays, err := repo.FetchHolidays(date)

		assert.NoError(t, err)
		assert.Empty(t, holidays) //
	})
}