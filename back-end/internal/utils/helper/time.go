package helper

import (
	// "log"
	"errors"
	"fmt"
	"strings"
	"time"

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

func CheckIsDayOff(summary string, description string) bool {
	// แปลงเป็นตัวพิมพ์เล็กทั้งหมดเพื่อให้เช็คง่าย
	summaryLower := strings.ToLower(summary)
	descLower := strings.ToLower(description)

	// 1. Blacklist Keywords: คำที่ถ้าเจอในชื่อวัน แสดงว่า "ไม่หยุด" แน่นอน
	notHolidayKeywords := []string{
		"valentine",    // วาเลนไทน์
		"halloween",    // ฮาโลวีน
		"loy krathong", // ลอยกระทง
		"christmas eve",
		"observance",   // วันสำคัญทางศาสนาที่ไม่หยุด
		"วาเลนไทน์",
		"ฮาโลวีน",
		"ลอยกระทง",
		"คริสต์มาสอีฟ",
		"วันสำคัญ",
	}

	for _, keyword := range notHolidayKeywords {
		if strings.Contains(summaryLower, keyword) {
			return false // เจอคำต้องห้าม = ไม่หยุด
		}
	}

	// 2. เช็คจาก Description (Google มักจะระบุประเภทวันหยุดไว้)
	// ถ้าใน description มีคำว่า "observance" (การสังเกตการณ์/วันสำคัญ) ถือว่าไม่หยุด
	if strings.Contains(descLower, "observance") || strings.Contains(strings.ToLower(descLower), "วันสำคัญ") {
		return false
	}

	// 3. (Optional) Whitelist: ถ้าต้องการความชัวร์ระดับสูง
	// อาจจะเช็คว่าต้องมีคำว่า "holiday", "หยุดราชการ" ถึงจะให้ผ่าน
	// แต่ปกติแค่ Blacklist ก็เพียงพอแล้วสำหรับ Calendar ไทย

	return true // ถ้าไม่เข้าเงื่อนไขข้างบนเลย ให้ถือว่าเป็นวันหยุดไว้ก่อน
}

func ParseTime(booking *domain.Booking) (*domain.Date, error) {
	layout := "2006-01-02 15:04:05"
	start, err := ParseTimeFormat(layout, booking.StartTime)
	if err != nil {
		return nil, err
	}

	end, err := ParseTimeFormat(layout, booking.EndTime)
	if err != nil {
		return nil, err
	}

	if err = CheckValidTime(start, end); err != nil {
		return nil, err
	}

	date := &domain.Date{
		StartStr: start.Format(time.RFC3339),
		EndStr: end.Format(time.RFC3339),
	}

	return date, nil
}

func CheckValidTime(startTime time.Time, endTime time.Time) error {
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

func IsWeekend(dateStr string) (time.Time, error) {
	layout := "2006-01-02 15:04:05"
	t, err := ParseTimeFormat(layout, dateStr)
	if err != nil {
		return time.Time{}, errors.New("Can't to book in day off") // หรือ handle error ตามต้องการ
	}

	if t.Weekday() == time.Saturday || t.Weekday() == time.Sunday {
		return time.Time{}, errors.New("Can't to book in day off")
	}

	// เช็คว่าเป็น เสาร์ (6) หรือ อาทิตย์ (0)
	return t, nil
}