package postgresRepo

import (
	"context"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type roomPostgresRepo struct {
	db *gorm.DB
}

func NewRoomPostgresRepo(db *gorm.DB) *roomPostgresRepo {
	return &roomPostgresRepo{db: db}
}

func (p *roomPostgresRepo) CreateRoomDB(ctx context.Context, room *domain.Room) error {
	if err := p.db.WithContext(ctx).Create(room).Error; err != nil {
		return err
	}

	return nil
}

func (p *roomPostgresRepo) UpdateRoomDB(ctx context.Context, room *domain.Room) error {
	result := p.db.
		WithContext(ctx).
		Where("id = ?", room.ID).
		Select("Name", "RoomNumber", "Location", "Capacity", "Status").
		Updates(room)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (p *roomPostgresRepo) DeleteRoomDB(ctx context.Context, roomID uuid.UUID) error {
	// ⭐️ ใช้ Transaction เพื่อให้แน่ใจว่า "ลบห้อง" และ "ยกเลิกจอง" ต้องสำเร็จทั้งคู่หรือพังทั้งคู่
	return p.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		
		// 1. ตรวจสอบก่อนว่ามีห้องนี้อยู่จริงไหม (และยังไม่ถูกลบ)
		// วิธีนี้จะช่วยให้เราส่ง error gorm.ErrRecordNotFound กลับไปได้ถูกต้อง
		var room domain.Room
		if err := tx.Where("id = ?", roomID).First(&room).Error; err != nil {
			return err // จะคืนค่า gorm.ErrRecordNotFound ถ้าหาไม่เจอ
		}

		// 2. ทำ Soft Delete ห้อง (จะไปอัปเดตคอลัมน์ deleted_at)
		if err := tx.Delete(&room).Error; err != nil {
			return err
		}

		// 3. ยกเลิกการจองในอนาคตที่ค้างอยู่ (Status 'confirm' และเวลาเริ่มจองยังไม่ถึง)
		// การใช้ tx.Model ช่วยให้ GORM รู้ว่าต้องทำงานกับตาราง bookings
		now := time.Now()
		result := tx.Model(&domain.Booking{}).
			Where("room_id = ? AND start_time > ? AND status = ?", roomID, now, "confirm").
			Updates(map[string]interface{}{
				"status":   "cancelled",
				"passcode": nil,
			})

		if result.Error != nil {
			return result.Error
		}

		// (Optional) คุณสามารถ log จำนวนการจองที่ถูกยกเลิกไปได้
		// log.Printf("Cancelled %d future bookings for room %s", result.RowsAffected, roomID)

		return nil
	})
}

func (p *roomPostgresRepo) GetRoomDB(ctx context.Context) ([]domain.Room, error) {
	var room []domain.Room

	result := p.db.
		WithContext(ctx).
		Select("id, name, capacity, status, room_number, location").
		Where("deleted_at IS NULL").
		Find(&room)

	if result.Error != nil {
		return nil, result.Error
	}

	return room, nil
}

func (p *roomPostgresRepo) GetRoomByID_DB(ctx context.Context, roomID uuid.UUID) (*domain.Room, error) {
	room := new(domain.Room)

	result := p.db.
		WithContext(ctx).
		Where("id = ?", roomID).
		Select("id, name, capacity, status, room_number").
		First(&room)

	if result.Error != nil {
		return nil, result.Error
	}

	return room, nil
}