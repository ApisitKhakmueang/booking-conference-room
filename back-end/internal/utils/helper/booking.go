package helper

import (
	// "log"
	"time"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

func GeneratePasscode() (string, error) {
	// 1. สุ่มตัวเลขแบบปลอดภัย (0 ถึง 9999)
	n, err := rand.Int(rand.Reader, big.NewInt(10000))
	if err != nil {
		return "", err
	}

	// 2. แปลงเป็น String และเติม 0 ข้างหน้าให้ครบ 4 หลักเสมอ
	// %04d แปลว่า: เป็นตัวเลข (d), ให้ครบ 4 หลัก (4), ถ้าไม่ครบเติม 0 ข้างหน้า (0)
	return fmt.Sprintf("%04d", n), nil
}

func ConvertBooking(bookings []domain.Booking) (map[string][]domain.Booking, error) {
	// 1. กำหนด Location ไทย
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return nil, err // กรณี Server ไม่มี Timezone นี้ (ควร Handle ให้ดี)
	}

	// 2. สร้าง Map
	grouped := make(map[string][]domain.Booking)

	// 3. วนลูป (รับแบบ Slice ธรรมดา ไม่ต้องมี *)
	for _, booking := range bookings {
		dateKey := booking.StartTime.In(loc).Format("2006-01-02")

		grouped[dateKey] = append(grouped[dateKey], booking)
	}

	return grouped, nil
}
