package helper

import (
	"fmt"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

func ConvertBooking(bookings []domain.Booking) map[string][]domain.Booking {
	// 1. กำหนด Location ไทย
	loc := time.FixedZone("ICT", 7*60*60)

	// 2. สร้าง Map
	grouped := make(map[string][]domain.Booking)

	// 3. วนลูป (รับแบบ Slice ธรรมดา ไม่ต้องมี *)
	for _, b := range bookings {

		// ✅ แก้จุดที่ 1: ใช้ time.Parse กับ layout RFC3339
		// สาเหตุที่ไม่ใช้ ParseInLocation เพราะตัว 'Z' ในข้อความมันบังคับว่าเป็น UTC อยู่แล้ว
		// ผลลัพธ์ t ที่ได้จะเป็นเวลา UTC
		t, err := time.Parse(time.RFC3339, b.StartTime)

		if err != nil {
			// เปิด log ไว้ดูเผื่อข้อมูลผิดพลาดรูปแบบอื่นอีก
			fmt.Printf("Error parsing time '%s': %v\n", b.StartTime, err)
			continue
		}

		// ✅ แก้จุดที่ 2: แปลงเป็นเวลาไทย (.In(loc)) ก่อนตัดวันที่
		// สำคัญมาก! เพราะ 'Z' คือ UTC ถ้าไม่ .In(loc) เวลา 05:00 น. บ้านเรา
		// จะถูกมองเป็น 22:00 น. ของเมื่อวาน (UTC) ทำให้ Group ผิดวัน
		dateKey := t.In(loc).Format("2006-01-02")

		grouped[dateKey] = append(grouped[dateKey], b)
	}

	return grouped
}
