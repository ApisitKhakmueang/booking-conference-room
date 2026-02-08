package gateway

import (
	// "errors"
	// "fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/helper"

	"google.golang.org/api/calendar/v3"
)

type googleCalendarGateway struct {
	service *calendar.Service // Google Client
}

func NewGoogleCalendarGateway(client *calendar.Service) domain.CalendarGateway {
	return &googleCalendarGateway{service: client}
}

func (r *googleCalendarGateway) FetchHolidays(startDate string, endDate string) ([]domain.Holiday, error) {
	// 1. Set Time Range (ตามปีที่ส่งมา)
	calendarID := "en.th#holiday@group.v.calendar.google.com"

	layout := "2006-01-02"
	timeMin, err := helper.ParseTimeFormat(layout, startDate)
	if err != nil {
		return nil, err
	}

	timeMax, err := helper.ParseTimeFormat(layout, endDate)
	if err != nil {
		return nil, err
	}

	timeMinStr := timeMin.Format(time.RFC3339)
	timeMaxStr := timeMax.Format(time.RFC3339)
	// log.Println("time min: ", timeMin)
	// log.Println("time max: ", timeMax)

	// 2. Fetch Events
	events, err := r.service.Events.List(calendarID).
		ShowDeleted(false).
		SingleEvents(true).
		TimeMin(timeMinStr).
		TimeMax(timeMaxStr).
		OrderBy("startTime").
		Do()

	if err != nil {
		return nil, err // ❌ ห้ามใช้ log.Fatalf
	}

	// 3. Process Data
	var holidays []domain.Holiday
	for _, item := range events.Items {
		dateStr := item.Start.Date
		// log.Println("date string: ", item.Start.Date)
		if dateStr == "" {
			dateStr = item.Start.DateTime
		}

		dateObj, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			log.Printf("Skipping invalid date: %s", dateStr)
			continue
		}

		isOff := helper.CheckIsDayOff(item.Summary, item.Description)
		// fmt.Printf("dateObj: %v, isOff: %v\n", dateObj, isOff)

		// 1. แปลงค่า DateRes เก็บใส่ตัวแปรไว้ก่อน
		dateVal := domain.DateRes(dateObj)

		// 2. เอาเวลาปัจจุบันเก็บใส่ตัวแปร (ถ้าจำเป็นต้องใส่เอง)
		now := time.Now()

		holidays = append(holidays, domain.Holiday{
			Date:      dateVal,
			Name:      item.Summary,
			IsDayOff:  &isOff,
			Source:    "google_calendar",
			UpdatedAt: &now,
		})
	}

	return holidays, nil
}

// func (s *googleCalendarGateway) CreateEvent(booking *domain.Booking, createEvent *domain.CreateEvent) (string, error) {
// 	Time, err := helper.ParseTime(booking)
// 	if err != nil {
// 		return "", err
// 	}

// 	err = s.IsRoomAvailable(createEvent.GoogleCalendarID, Time)
// 	if err != nil {
// 		return "", err
// 	}

// 	log.Printf("after check available")
// 	log.Println("calendar id: ", createEvent.GoogleCalendarID)
// 	description := fmt.Sprintf("Booker: %s", createEvent.Email)

// 	event := &calendar.Event{
// 		Summary:     booking.Title, // ใส่ชื่อผู้จองในหัวข้อแทน
// 		Description: description,
// 		Start:       &calendar.EventDateTime{DateTime: Time.StartStr},
// 		End:         &calendar.EventDateTime{DateTime: Time.EndStr},
// 		// ลบส่วน Attendees ออกทั้งหมด
// 	}
// 	createdEvent, err := s.service.Events.Insert(createEvent.GoogleCalendarID, event).Do()

// 	if err != nil {
// 		return "", err
// 	}

// 	return createdEvent.Id, nil
// }

// func (s *googleCalendarGateway) UpdateEventSameRoom(booking *domain.Booking) error {
// 	Time, err := helper.ParseTime(booking)
// 	if err != nil {
// 		// log.Println("out update event")
// 		return err
// 	}
	
// 	err = s.IsRoomAvailableWithExclude(booking.Calendar.GoogleCalendarID, Time, booking.GoogleEventID)
// 	if err != nil {
// 		return err
// 	}

// 	// log.Println("enter update event")
// 	// log.Println("calendar id: ", booking.Calendar.GoogleCalendarID)
// 	// log.Println("event id: ", booking.GoogleEventID)

// 	event := &calendar.Event{
// 		Summary:	booking.Title, // ใส่ชื่อผู้จองในหัวข้อแทน
// 		Start: 		&calendar.EventDateTime{DateTime: Time.StartStr},
// 		End: 			&calendar.EventDateTime{DateTime: Time.EndStr},
// 		// ลบส่วน Attendees ออกทั้งหมด
// 	}

// 	_, err = s.service.Events.Patch(booking.Calendar.GoogleCalendarID, booking.GoogleEventID, event).Do()
// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

// func (s *googleCalendarGateway) CancelEvent(roomCalendarID string, eventID string) error {
// 	err := s.service.Events.Delete(roomCalendarID, eventID).Do()
// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

// func (s *googleCalendarGateway) IsRoomAvailable(calendarID string, Time *domain.Date) error {
// 	req := &calendar.FreeBusyRequest{
// 		TimeMin: Time.StartStr,
// 		TimeMax: Time.EndStr,
// 		Items: []*calendar.FreeBusyRequestItem{
// 			{Id: calendarID},
// 		},
// 	}

// 	resp, err := s.service.Freebusy.Query(req).Do()
// 	if err != nil {
// 		return err
// 	}

// 	busy := resp.Calendars[calendarID].Busy

// 	if len(busy) > 0 {
// 		return errors.New("This time unavailable")
// 	}

// 	return nil
// }

// func (s *googleCalendarGateway) IsRoomAvailableWithExclude(calendarID string, Time *domain.Date, excludeEventID string) error {
	
// 	// 1. เรียก Events.List แทน FreeBusy
// 	// SingleEvents: true เพื่อให้แตก Recurrent event ออกมาเป็นชิ้นๆ เช็คง่าย
// 	eventsResult, err := s.service.Events.List(calendarID).
// 		TimeMin(Time.StartStr).
// 		TimeMax(Time.EndStr).
// 		SingleEvents(true).
// 		Do()

// 	if err != nil {
// 		return err
// 	}

// 	// 2. แปลงเวลาที่ต้องการจองเป็น time.Time เพื่อใช้เทียบ
// 	reqStart, _ := time.Parse(time.RFC3339, Time.StartStr)
// 	reqEnd, _ := time.Parse(time.RFC3339, Time.EndStr)

// 	// 3. วนลูปเช็ค Event ที่ Google ส่งกลับมา
// 	for _, item := range eventsResult.Items {
		
// 		// ✅ จุดสำคัญ: ถ้านี่คือ Event ตัวเอง ให้ข้ามไปเลย (ไม่นับว่าขวาง)
// 		if excludeEventID != "" && item.Id == excludeEventID {
// 			continue
// 		}

// 		// แปลงเวลาของ Event นั้นๆ
// 		if item.Start.DateTime == "" || item.End.DateTime == "" {
// 			continue // ข้ามพวก All-day event (ถ้าไม่เกี่ยว)
// 		}
		
// 		eventStart, _ := time.Parse(time.RFC3339, item.Start.DateTime)
// 		eventEnd, _ := time.Parse(time.RFC3339, item.End.DateTime)

// 		// 4. Logic เช็ค Overlap (ชนกันไหม)
// 		// สูตร: (Start A < End B) AND (End A > Start B)
// 		if reqStart.Before(eventEnd) && reqEnd.After(eventStart) {
// 			return fmt.Errorf("Time slot is busy with event: %s", item.Summary)
// 		}
// 	}

// 	return nil
// }
