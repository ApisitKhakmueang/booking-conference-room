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

func NewGoogleCalendarGateway(client *calendar.Service) domain.ConfigGateWay {
	return &googleCalendarGateway{service: client}
}

func (r *googleCalendarGateway) FetchHolidays(date *domain.Date) ([]domain.Holiday, error) {
	// 1. Set Time Range (ตามปีที่ส่งมา)
	calendarID := "en.th#holiday@group.v.calendar.google.com"

	layout := "2006-01-02"
	timeMin, err := helper.ParseTimeFormat(layout, date.StartStr)
	if err != nil {
		return nil, err
	}

	timeMax, err := helper.ParseTimeFormat(layout, date.EndStr)
	if err != nil {
		return nil, err
	}

	timeMinStr := timeMin.Format(time.RFC3339)
	timeMaxStr := timeMax.Format(time.RFC3339)
	log.Println("time min: ", timeMin)
	log.Println("time max: ", timeMax)

	// 2. Fetch Events
	events, err := r.service.Events.List(calendarID).
		ShowDeleted(false).
		SingleEvents(true).
		TimeMin(timeMinStr).
		TimeMax(timeMaxStr).
		TimeZone("Asia/Bangkok").
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