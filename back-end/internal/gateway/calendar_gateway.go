package gateway

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

	"google.golang.org/api/calendar/v3"
)

type googleCalendarGateway struct {
	service *calendar.Service // Google Client
}

func NewGoogleCalendarGateway(client *calendar.Service) domain.CalendarGateway {
	return &googleCalendarGateway{ service: client }
}

func (s *googleCalendarGateway) CreateEvent() (string, error) {
	return "test", nil
}

func (s *googleCalendarGateway) UpdateEvent() (string, error) {
	return "test", nil
}

func (s *googleCalendarGateway) CancelEvent() (string, error) {
	return "test", nil
}