package helper

import (
	"time"
	"fmt"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

func ConvertDateToStr(duration string, dateInput string) (*domain.Date, error) {
	DateTime := new(domain.Date)
	
	// 1. กำหนด Location (ICT)
	loc := time.FixedZone("ICT", 7*60*60)

	var startOfMonth time.Time
	var endOfMonth time.Time
	var err error

	// 2. แยก Logic ตาม Duration
	switch duration {
	case "month":
		// --- โหมดเดือน ---
		// Input: "2026-03"
		// Start: 2026-03-01
		// End:   2026-04-01 (+1 เดือน)
		layout := "2006-01"
		startOfMonth, err = time.ParseInLocation(layout, dateInput, loc)
		if err == nil {
			endOfMonth = startOfMonth.AddDate(0, 1, 0)
		}

	case "week":
		// --- โหมดสัปดาห์ ---
		// Input: "2026-03-15"
		// Start: 2026-03-15
		// End:   2026-03-22 (+7 วัน)
		layout := "2006-01-02"
		startOfMonth, err = time.ParseInLocation(layout, dateInput, loc)
		if err == nil {
			startOfMonth = GetStartDayWeek(startOfMonth)
			endOfMonth = startOfMonth.AddDate(0, 0, 7)
		}

	case "day":
		// --- โหมดวันเดียว ---
		// Input: "2026-03-15"
		// Start: 2026-03-15 00:00:00
		// End:   2026-03-16 00:00:00 (+1 วัน เพื่อให้ครอบคลุมถึง 23:59:59)
		layout := "2006-01-02"
		startOfMonth, err = time.ParseInLocation(layout, dateInput, loc)
		if err == nil {
			endOfMonth = startOfMonth.AddDate(0, 0, 1)
		}

	default:
		return nil, fmt.Errorf("invalid duration mode: %s", duration)
	}

	// 3. เช็ค Error จากการ Parse
	if err != nil {
		return nil, fmt.Errorf("invalid date format for mode '%s': %v", duration, err)
	}

	// 4. แปลงกลับเป็น String Format สำหรับ Query Database
	DateTime.StartStr = startOfMonth.Format("2006-01-02 15:04:05")
	DateTime.EndStr = endOfMonth.Format("2006-01-02 15:04:05")
	
	return DateTime, nil
}

func ParseTimeFormat(layout string, timeStr string) (time.Time, error) {
	loc := time.FixedZone("ICT", 7*60*60)
	t, err := time.ParseInLocation(layout, timeStr, loc)
	if err != nil {
		return time.Time{}, err
	}

	return t, nil
}

func GetStartDayWeek(t time.Time) time.Time {
	// 1. หา Offset ว่าวันที่ส่งมา ห่างจากวันอาทิตย์กี่วัน
	// Sunday = 0, Monday = 1, ..., Saturday = 6
	offset := int(t.Weekday())

	// 2. หาวันอาทิตย์ที่เป็นจุดเริ่มต้น โดยการลบ Offset ออกจากวันที่ส่งมา
	startOfWeek := t.AddDate(0, 0, -offset)

	return startOfWeek
}