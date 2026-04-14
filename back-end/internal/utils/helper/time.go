package helper

import (
	// "log"
	"errors"
	"fmt"
	"strconv"

	// "fmt"
	// "fmt"
	"strings"
	"time"
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

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

func ValidateBusinessHours(start, end time.Time, openMinutes, closeMinutes int) error {
	// 1. โหลด Timezone ไทย (Asia/Bangkok)
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return err // กรณี Server ไม่มี Timezone นี้ (ควร Handle ให้ดี)
	}

	// 2. แปลงเวลาที่รับมา (UTC) ให้เป็นเวลาไทย
	thaiStart := start.In(loc)
	thaiEnd := end.In(loc)

	startMin := toTotalMinutes(thaiStart)
	endMin := toTotalMinutes(thaiEnd)

	// 1. ตรวจสอบเวลาเริ่ม (ห้ามก่อนเวลาเปิด)
	if startMin < openMinutes {
		return fmt.Errorf("Not allow booking before %02d:%02d", openMinutes/60, openMinutes%60)
	}

	// 2. ตรวจสอบเวลาจบ (ห้ามเกินเวลาปิด)
	if endMin > closeMinutes {
		return fmt.Errorf("Not allow booking after %02d:%02d", closeMinutes/60, closeMinutes%60)
	}

	// 5. (แถม) เช็คว่าต้องจองและจบในวันเดียวกันไหม? (ถ้าไม่ข้ามคืน)
	if thaiStart.Day() != thaiEnd.Day() {
		return errors.New("Not allow booking in different days")
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

func CheckBeforeNow(start time.Time) error {
	now := time.Now()

	if start.After(now) {
		return nil
	}

	return errors.New("Can't book in the past.")
}

func CheckMaxAdvanceBooking(start time.Time, maxAdvanceDays int) error {
	now := time.Now()
	
	// คำนวณเวลาปัจจุบัน + 30 วัน
	maxAllowedDate := now.AddDate(0, 0, maxAdvanceDays) 

	if start.After(maxAllowedDate) {
		return errors.New("Cannot book more than 30 days in advance")
	}

	return nil
}

func TotalMinutesFromString(timeStr string) (int, error) {
	// 1. แยก string ด้วย ":" เช่น "08:30" -> ["08", "30"]
	parts := strings.Split(timeStr, ":")
	if len(parts) != 2 {
		return 0, fmt.Errorf("invalid time format: %s", timeStr)
	}

	// 2. แปลงส่วนชั่วโมงเป็น int
	hours, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, fmt.Errorf("invalid hour: %v", err)
	}

	// 3. แปลงส่วนนาทีเป็น int
	minutes, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, fmt.Errorf("invalid minute: %v", err)
	}

	// 4. คำนวณนาทีรวม: (ชั่วโมง * 60) + นาที
	total := (hours * 60) + minutes

	return total, nil
}

// Internal function
func toTotalMinutes(t time.Time) int {
	return t.Hour()*60 + t.Minute()
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