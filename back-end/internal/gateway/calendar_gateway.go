package gateway

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"

	"google.golang.org/api/calendar/v3"
)

type googleCalendarGateway struct {
	service *calendar.Service // Google Client
}

func NewGoogleCalendarGateway(client *calendar.Service) domain.CalendarGateway {
	return &googleCalendarGateway{service: client}
}

func (s *googleCalendarGateway) CreateEvent(booking *domain.Booking, createEvent *domain.CreateEvent) (string, error) {
	Time, err := helper.ParseTime(booking)
	if err != nil {
		return "", err
	}

	err = s.IsRoomAvailable(createEvent.GoogleCalendarID, Time)
	if err != nil {
		return "", err
	}

	log.Printf("after check available")
	log.Println("calendar id: ", createEvent.GoogleCalendarID)
	description := fmt.Sprintf("Booker: %s", createEvent.Email)

	event := &calendar.Event{
		Summary:     booking.Title, // ใส่ชื่อผู้จองในหัวข้อแทน
		Description: description,
		Start:       &calendar.EventDateTime{DateTime: Time.StartStr},
		End:         &calendar.EventDateTime{DateTime: Time.EndStr},
		// ลบส่วน Attendees ออกทั้งหมด
	}
	createdEvent, err := s.service.Events.Insert(createEvent.GoogleCalendarID, event).Do()

	if err != nil {
		return "", err
	}

	return createdEvent.Id, nil
}

func (s *googleCalendarGateway) UpdateEventSameRoom(booking *domain.Booking) error {
	Time, err := helper.ParseTime(booking)
	if err != nil {
		// log.Println("out update event")
		return err
	}
	
	err = s.IsRoomAvailable(booking.Calendar.GoogleCalendarID, Time)
	if err != nil {
		return err
	}

	// log.Println("enter update event")
	// log.Println("calendar id: ", booking.Calendar.GoogleCalendarID)
	// log.Println("event id: ", booking.GoogleEventID)

	event := &calendar.Event{
		Summary:	booking.Title, // ใส่ชื่อผู้จองในหัวข้อแทน
		Start: 		&calendar.EventDateTime{DateTime: Time.StartStr},
		End: 			&calendar.EventDateTime{DateTime: Time.EndStr},
		// ลบส่วน Attendees ออกทั้งหมด
	}

	_, err = s.service.Events.Patch(booking.Calendar.GoogleCalendarID, booking.GoogleEventID, event).Do()
	if err != nil {
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

func (r *googleCalendarGateway) FetchHolidays(year int) ([]domain.Holiday, error) {
	// 1. Set Time Range (ตามปีที่ส่งมา)
	calendarID := "en.th#holiday@group.v.calendar.google.com"

	loc := time.FixedZone("ICT", 7*60*60)
	timeMin := time.Date(year, 1, 1, 0, 0, 0, 0, loc).Format(time.RFC3339)
	timeMax := time.Date(year, 12, 31, 23, 59, 59, 0, loc).Format(time.RFC3339)

	// 2. Fetch Events
	events, err := r.service.Events.List(calendarID).
		ShowDeleted(false).
		SingleEvents(true).
		TimeMin(timeMin).
		TimeMax(timeMax).
		OrderBy("startTime").
		Do()

	if err != nil {
		return nil, err // ❌ ห้ามใช้ log.Fatalf
	}

	// 3. Process Data
	var holidays []domain.Holiday
	for _, item := range events.Items {
		dateStr := item.Start.Date
		if dateStr == "" {
			dateStr = item.Start.DateTime
		}

		dateObj, err := time.Parse("2006-01-02", dateStr[:10])
		if err != nil {
			log.Printf("Skipping invalid date: %s", dateStr)
			continue
		}

		isOff := helper.CheckIsDayOff(item.Summary, item.Description)

		holidays = append(holidays, domain.Holiday{
			Date:      domain.DateRes(dateObj),
			Name:      item.Summary,
			IsDayOff:  &isOff,
			Source:    "google_calendar",
			UpdatedAt: time.Now(),
		})
	}

	return holidays, nil
}

func (s *googleCalendarGateway) IsRoomAvailable(calendarID string, Time *domain.Date) error {
	req := &calendar.FreeBusyRequest{
		TimeMin: Time.StartStr,
		TimeMax: Time.EndStr,
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
