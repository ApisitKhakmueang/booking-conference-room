package helper

import (
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

func ConvertDateToStr(date string) (*domain.Date, error) {
	DateTime := new(domain.Date)

	layout := "2006-01"
	startOfMonth, err := ParseTimeFormat(layout, date)
	if err != nil {
		return nil, err
	}

	// 3. หาวันแรกของเดือนถัดไป (เพื่อใช้เป็นขอบเขตบน)
	// AddDate(ปี, เดือน, วัน) -> เพิ่ม 1 เดือน
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	// แปลงเป็น String เพื่อใช้ Query (ถ้าใน DB เก็บเป็น String)
	// หรือถ้า DB เก็บเป็น Timestamp ก็ส่งตัวแปร startOfMonth/endOfMonth ไปตรงๆ ได้เลย
	startStr := startOfMonth.Format("2006-01-02 15:04:05")
	endStr := endOfMonth.Format("2006-01-02 15:04:05")

	DateTime.StartStr = startStr
	DateTime.EndStr = endStr
	
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