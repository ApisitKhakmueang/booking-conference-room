// ไฟล์: internal/usecase/base_usecase.go
package usecase

import (
	"context"
	"log"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

// BaseUsecase จะเป็น struct กลางที่เก็บ Interface ของ Publisher
type BaseUsecase struct {
	publisher domain.RealtimePublisher
}

func NewBaseUsecase(pub domain.RealtimePublisher) BaseUsecase {
	return BaseUsecase{
		publisher: pub,
	}
}

// ⭐️ เปลี่ยน completedBooking เป็น payloadData interface{} เพื่อให้รับข้อมูลได้ทุกแบบ
func (b *BaseUsecase) PublishEvent(event string, roomNumber uint, payloadData interface{}) {
	payload := map[string]interface{}{
		"room_number": roomNumber,
		"data":        payloadData, // เปลี่ยนชื่อคีย์จาก "booking" เป็น "data" ให้เป็นกลาง
	}

	go func() {
		bgCtx := context.Background()
		// วิ่งไปเรียกไฟล์ redis_publisher ตรงนี้แหละครับ!
		if pubErr := b.publisher.PublishEvent(bgCtx, event, payload); pubErr != nil {
			log.Printf("Failed to publish real-time event: %v", pubErr)
		}
	}()
}