package gateway

import (
	"errors"
	"fmt"
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

func (s *googleCalendarGateway) CreateEvent(booking *domain.Booking, createEvent *domain.CreateEvent) (string, error) {
	Time, err := s.ParseTime(booking)
	if err != nil {
		return "", err
	}

	err = s.IsRoomAvailable(createEvent.GoogleCalendarID, Time)
	if err != nil {
		return "", err
	}

	log.Printf("after check available")
	log.Println("calendar id: ", createEvent.GoogleCalendarID)
	summary := fmt.Sprintf("Book %s (By %s)", createEvent.RoomName, createEvent.Email)
	description := fmt.Sprintf("Booker: %s", createEvent.Email)

	event := &calendar.Event{
		Summary:     summary, // ใส่ชื่อผู้จองในหัวข้อแทน
		Description: description,
		Start:       &calendar.EventDateTime{DateTime: Time[0]},
		End:         &calendar.EventDateTime{DateTime: Time[1]},
		// ลบส่วน Attendees ออกทั้งหมด
	}
	createdEvent, err := s.service.Events.Insert(createEvent.GoogleCalendarID, event).Do()

	if err != nil {
		return "", err
	}

	return createdEvent.Id, nil
}

func (s *googleCalendarGateway) UpdateEventSameRoom(booking *domain.Booking) error {
	Time, err := s.ParseTime(booking)
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
		Start: 	&calendar.EventDateTime{DateTime: Time[0]},
		End: 		&calendar.EventDateTime{DateTime: Time[1]},
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
	start, err := helper.ParseTimeFormat(layout, booking.StartTime)
	if err != nil {
		return timeSlice, err
	}

	end, err := helper.ParseTimeFormat(layout, booking.EndTime)
	if err != nil {
		return timeSlice, err
	}

	if err = u.CheckValidTime(start, end); err != nil {
		return timeSlice, err
	}

	timeSlice = append(timeSlice, start.Format(time.RFC3339))
	timeSlice = append(timeSlice, end.Format(time.RFC3339))

	return timeSlice, nil
}

func (u *googleCalendarGateway) CheckValidTime(startTime time.Time, endTime time.Time) error {
	startLimit := time.Date(startTime.Year(), startTime.Month(), startTime.Day(), 8, 0, 0, 0, startTime.Location())
	endLimit := time.Date(startTime.Year(), startTime.Month(), startTime.Day(), 20, 0, 0, 0, startTime.Location())

	// 4. ตรวจสอบเงื่อนไข (ต้องไม่ก่อน 08:00 และ ต้องไม่หลัง 20:00)
	// หมายเหตุ: ใช้ Equal เพื่อรวมขอบเขต 08:00:00 และ 20:00:00 เป๊ะๆ ด้วย
	isStartValid := (startTime.Equal(startLimit) || startTime.After(startLimit)) && (startTime.Equal(endLimit) || startTime.Before(endLimit))
	isEndValid := (endTime.Equal(startLimit) || endTime.After(startLimit)) && (endTime.Equal(endLimit) || endTime.Before(endLimit))
	// log.Printf("isStartValid: %v, isEndValid: %v", isStartValid, isEndValid)

	if !(isStartValid && isEndValid) {
		return errors.New("Please booking in 8 a.m. - 8 p.m.")
	} 

	return nil
}
