package postgresRepo

import (
	"context"
	"errors"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type workerPostgresRepo struct {
	db *gorm.DB
}

func NewWorkerPostgresRepo(db *gorm.DB) domain.WorkerPostgresRepo {
	return &workerPostgresRepo{db: db}
}

func (p *workerPostgresRepo) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	booking := new(domain.Booking)
	// ใช้ Preload ดึงข้อมูลตารางที่เกี่ยวข้องมาด้วยให้เหมือนตอน Get ปกติ
	err := p.db.
		WithContext(ctx).
		Preload("Room").
		Preload("User").
		First(booking, id).Error
	
	return booking, err
}

func (p *workerPostgresRepo) GetRoomNumberDB(ctx context.Context, bookingID uuid.UUID) (uint, error) {
	instBooking := new(domain.Booking)
	err := p.db.WithContext(ctx).
		Preload("Room", func(db *gorm.DB) *gorm.DB {
			// ต้อง Select ID (PK) ของ Calendar ด้วย เพื่อให้ GORM จับคู่ถูก
			return db.Select("id, room_number") 
    }).
		Select("room_id").
		First(instBooking, bookingID).Error

	if err != nil {
		return 0, err
	}

	return instBooking.Room.RoomNumber, err
}

func (p *workerPostgresRepo) UpdateBookingStatusDB(ctx context.Context, bookingID uuid.UUID, newStatus string) (*domain.Booking, error) {
	updatedBooking := new(domain.Booking)

	// ⭐️ สั่ง GORM ว่า: 
	// 1. ไปที่ตาราง bookings
	// 2. เติมคำสั่ง RETURNING * ลงไปนะ (clause.Returning{})
	// 3. หา id นี้
	// 4. สั่งอัปเดตคอลัมน์ status
	result := p.db.WithContext(ctx).
		Model(updatedBooking).
		Clauses(clause.Returning{}). // ตัวนี้แหละครับที่เสก RETURNING * ให้
		Where("id = ? AND status = ?", bookingID, "confirm").
		Updates(map[string]interface{}{
			"status": newStatus,
			"passcode": nil,
		})

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
			// คืนค่า Error กลับไปบอก Usecase ว่าหาคิวจองไม่เจอ หรือสถานะไม่ใช่ confirm แล้ว
			return nil, errors.New("booking not found or status is not 'confirm'") 
			// หรือจะใช้ gorm.ErrRecordNotFound ก็ได้ครับ
	}

	// updatedBooking จะถูกเติมข้อมูลใหม่ครบทุกฟิลด์เรียบร้อย
	return updatedBooking, nil
}