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
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return nil, err // กรณี Server ไม่มี Timezone นี้ (ควร Handle ให้ดี)
	}

	var startOfMonth time.Time
	var endOfMonth time.Time

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
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return time.Time{}, err // กรณี Server ไม่มี Timezone นี้ (ควร Handle ให้ดี)
	}
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

func ValidateBusinessHours(start, end time.Time) error {
	// 1. โหลด Timezone ไทย (Asia/Bangkok)
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return err // กรณี Server ไม่มี Timezone นี้ (ควร Handle ให้ดี)
	}

	// 2. แปลงเวลาที่รับมา (UTC) ให้เป็นเวลาไทย
	thaiStart := start.In(loc)
	thaiEnd := end.In(loc)

	// 3. กฎข้อที่ 1: ห้ามเริ่มก่อน 08:00
	// (เช็คชั่วโมง < 8)
	if thaiStart.Hour() < 8 {
		return errors.New("Not allow to book before 08:00 a.m.")
	}

	// 4. กฎข้อที่ 2: ห้ามจบหลัง 20:00
	// กรณีที่ 1: ชั่วโมงมากกว่า 20 (เช่น 21:00) -> ผิด
	// กรณีที่ 2: ชั่วโมงเป็น 20 แต่มีเศษนาที (เช่น 20:01) -> ผิด
	if thaiEnd.Hour() > 20 || (thaiEnd.Hour() == 20 && thaiEnd.Minute() > 0) {
		return errors.New("Not allow to book after 08:00 p.m")
	}

	// 5. (แถม) เช็คว่าต้องจองและจบในวันเดียวกันไหม? (ถ้าไม่ข้ามคืน)
	if thaiStart.Day() != thaiEnd.Day() {
		return errors.New("Booking in same day")
	}

	if !thaiStart.Before(thaiEnd) { 
		return errors.New("Start time must be less than end time")
	}

	return nil
}

func IsWeekend(date time.Time) error {
	// layout := "2006-01-02 15:04:05"
	// t, err := ParseTimeFormat(layout, dateStr)
	// if err != nil {
	// 	return time.Time{}, errors.New("Can't to book in day off") // หรือ handle error ตามต้องการ
	// }

	if date.Weekday() == time.Saturday || date.Weekday() == time.Sunday {
		return errors.New("Can't to book in day off")
	}

	// เช็คว่าเป็น เสาร์ (6) หรือ อาทิตย์ (0)
	return nil
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

// func ParseTime(booking *domain.Booking) (*domain.Date, error) {
// 	layout := "2006-01-02 15:04:05"
// 	start, err := ParseTimeFormat(layout, booking.StartTime)
// 	if err != nil {
// 		return nil, err
// 	}

// 	end, err := ParseTimeFormat(layout, booking.EndTime)
// 	if err != nil {
// 		return nil, err
// 	}

// 	if err = CheckValidTime(start, end); err != nil {
// 		return nil, err
// 	}

// 	date := &domain.Date{
// 		StartStr: start.Format(time.RFC3339),
// 		EndStr: end.Format(time.RFC3339),
// 	}

// 	return date, nil
// }