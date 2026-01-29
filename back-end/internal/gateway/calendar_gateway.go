package gateway

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

	"google.golang.org/api/calendar/v3"
)

type googleCalendarGateway struct {
	service *calendar.Service // Google Client
}

func NewGoogleCalendarGateway(client *calendar.Service) domain.CalendarGateway {
	return &googleCalendarGateway{ service: client }
}

func (s *googleCalendarGateway) CreateEvent(booking *domain.Booking, googleCalendarID string, filter *domain.SearchFilter) (string, error) {
	Time, err := s.ParseTime(booking)
	if err != nil {
		return "", err
	}
	
	err = s.IsRoomAvailable(googleCalendarID, Time)
	if err != nil {
		return "", err
	}

	log.Printf("after check available")
	summary := fmt.Sprintf("Book room %d (By %s)", filter.Room, filter.Email)
	description := fmt.Sprintf("Booker: %s", filter.Email)

	event := &calendar.Event{
		Summary: summary, // ใส่ชื่อผู้จองในหัวข้อแทน
		Description: description,
		Start: &calendar.EventDateTime{DateTime: Time[0]},
		End:   &calendar.EventDateTime{DateTime: Time[1]},
		// ลบส่วน Attendees ออกทั้งหมด
	}
	createdEvent, err := s.service.Events.Insert(googleCalendarID, event).Do()

	if err != nil {
		return "", err
	}

	return createdEvent.Id, nil
}

func (s *googleCalendarGateway) UpdateEvent(booking *domain.Booking, googleCalendarID string, filter *domain.SearchFilter) error {
	Time, err := s.ParseTime(booking)
	if err != nil {
		return err
	}

	err = s.IsRoomAvailable(googleCalendarID, Time)
	if err != nil {
		return err
	}

	summary := fmt.Sprintf("Book room %d (By %s)", filter.Room, filter.Email)
	description := fmt.Sprintf("Booker: %s", filter.Email)

	event := &calendar.Event{
		Summary: summary, // ใส่ชื่อผู้จองในหัวข้อแทน
		Description: description,
		Start: &calendar.EventDateTime{DateTime: Time[0]},
		End:   &calendar.EventDateTime{DateTime: Time[1]},
		// ลบส่วน Attendees ออกทั้งหมด
	}

	_, err = s.service.Events.Patch(googleCalendarID, booking.GoogleEventID, event).Do()
	if err != nil{
		return err
	}

	return nil
}

func (s *googleCalendarGateway) CancelEvent(roomCalendarID string, eventID string) error {
	err := s.service.Events.Delete(roomCalendarID, eventID).Do()
	if err != nil {
		return err
	}

	return nil
}

func (s *googleCalendarGateway) IsRoomAvailable(calendarID string, Time []string) error {
	req := &calendar.FreeBusyRequest{
		TimeMin: Time[0],
		TimeMax: Time[1],
		Items: []*calendar.FreeBusyRequestItem{
			{Id: calendarID},
		},
	}

	resp, err := s.service.Freebusy.Query(req).Do()
	if err != nil {
		return err
	}

	busy := resp.Calendars[calendarID].Busy

	if len(busy) > 0 {
		return errors.New("This time unavailable")
	}

	return nil
}

func (u *googleCalendarGateway) ParseTime(booking *domain.Booking) ([]string, error) {
	var timeSlice []string

	layout := "2006-01-02 15:04:05"
	loc := time.FixedZone("ICT", 7*60*60)

	start, err := time.ParseInLocation(layout, booking.StartTime, loc)
	if err != nil{
		return timeSlice, err
	}
	
	end, err := time.ParseInLocation(layout, booking.EndTime, loc)
	if err != nil {
		return timeSlice, err
	}
	timeSlice = append(timeSlice, start.Format(time.RFC3339))
	timeSlice = append(timeSlice, end.Format(time.RFC3339))

	return timeSlice, nil
}