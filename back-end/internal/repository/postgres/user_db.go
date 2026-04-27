package postgresRepo

import (
	"context"
	"errors"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type userPostgresRepo struct {
	db *gorm.DB
}

func NewUserPostgresRepo(db *gorm.DB) *userPostgresRepo {
	return &userPostgresRepo{db: db}
}

func (p *userPostgresRepo) GetPaginatedUsersDB(ctx context.Context, q *domain.UserPaginationQuery) ([]domain.User, int64, error) {
	var users []domain.User
	var totalItems int64

	query := p.db.WithContext(ctx).Model(&domain.User{}).Where("role = ?", "user")
	if q.Search != "" {
		query = query.Where("full_name ILIKE ? OR email ILIKE ?", "%"+q.Search+"%", "%"+q.Search+"%")
	}

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (q.Page - 1) * q.Limit
	if err := query.Offset(offset).Limit(q.Limit).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, 0, err
	}

	// ⭐️ คืนค่ากลับไป 3 ตัวตรงๆ
	return users, totalItems, nil
}

func (p *userPostgresRepo) GetUserOverviewDB(ctx context.Context, userID uuid.UUID) (*domain.UserOverviewResponse, error) {
	var userInfo domain.UserInfoRes
	var stats domain.UserStatsRes

	// 1. ดึงข้อมูลพื้นฐานของ User
	if err := p.db.WithContext(ctx).Model(&domain.User{}).
		Select("id, full_name, email, avatar_url, role, status").
		Where("id = ?", userID).
		First(&userInfo).Error; err != nil {
		return nil, err
	}

	// 2. นับสถิติทุกสถานะใน Query เดียว! (Single Query Aggregation)
	if err := p.db.WithContext(ctx).Model(&domain.Booking{}).
		Select(`
			COALESCE(SUM(CASE WHEN status = 'confirm' THEN 1 ELSE 0 END), 0) as upcoming,
			COALESCE(SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END), 0) as completed,
			COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
			COALESCE(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END), 0) as no_show
		`).
		Where("user_id = ?", userID).
		Scan(&stats).Error; err != nil {
		return nil, err
	}

	return &domain.UserOverviewResponse{
		User:       userInfo,
		Statistics: stats,
	}, nil
}

func (p *userPostgresRepo) GetPaginatedUserBookingsDB(ctx context.Context, userID uuid.UUID, q *domain.BookingPaginationQuery) ([]domain.UserBookingHistoryRes, int64, error) {
	var bookings []domain.Booking 
	var totalItems int64

	query := p.db.WithContext(ctx).Model(&domain.Booking{}).
		Preload("Room"). // ตอนนี้ Preload จะทำงานได้ 100% แล้ว
		Where("user_id = ?", userID)

	// 2. Filter ตาม Status (ถ้ามีการส่งมาและไม่ใช่ค่าว่างหรือ ALL)
	if q.Status != "" && q.Status != "all" {
		query = query.Where("status = ?", q.Status)
	}

	// 3. Filter ตาม เดือนและปี (สร้างขอบเขตวันที่)
	if q.Year > 0 && q.Month > 0 {
		// หาวันแรกของเดือน (เช่น 2026-04-01 00:00:00)
		loc, err := time.LoadLocation("Asia/Bangkok")
		if err != nil {
			return nil, 0, err
		}
		startDate := time.Date(q.Year, time.Month(q.Month), 1, 0, 0, 0, 0, loc)
		// หาวันแรกของเดือนถัดไป (เช่น 2026-05-01 00:00:00)
		endDate := startDate.AddDate(0, 1, 0)

		// ค้นหาช่วงเวลาที่ StartTime อยู่ภายในเดือนนั้น
		query = query.Where("start_time >= ? AND start_time < ?", startDate, endDate)
	}

	// 4. นับจำนวน (Count) สำหรับทำ Pagination
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	// 5. ดึงข้อมูลจริง (Offset/Limit) โดยเรียงจากวันที่ล่าสุดก่อน
	offset := (q.Page - 1) * q.Limit
	if err := query.Offset(offset).Limit(q.Limit).Order("start_time DESC").Find(&bookings).Error; err != nil {
		return nil, 0, err
	}

	var result []domain.UserBookingHistoryRes
	for _, b := range bookings {
		// นำข้อมูลจาก Model มาใส่ใน DTO ทีละรายการ
		dto := domain.UserBookingHistoryRes{
			ID:          b.ID,
			Title:       b.Title,
			StartTime:   b.StartTime,
			EndTime:     b.EndTime,
			Status:      b.Status, // สมมติว่า Status ใน Booking เป็น string ธรรมดา 
			CheckedInAt: b.CheckedInAt,
			Room: domain.UserRoomRes{ // Mapping ข้อมูลห้อง
				ID:         b.Room.ID,
				Name:       b.Room.Name,
				RoomNumber: b.Room.RoomNumber,
				Location:   b.Room.Location,
			},
		}
		result = append(result, dto)
	}

	// ⭐️ 3. Return ตัว result ที่แปลงร่างเสร็จแล้วกลับไป
	return result, totalItems, nil
}

func (p *userPostgresRepo) UpdateUserStatusDB(ctx context.Context, userID uuid.UUID, newStatus string) error {
	result := p.db.WithContext(ctx).
		Model(&domain.User{}).
		Where("id = ?", userID).
		Update("status", newStatus) // ลบลูกน้ำออกแล้ว

	// 1. เช็ค Error จาก Database (เช่น connection หลุด หรือ query พัง)
	if result.Error != nil {
		return result.Error
	}

	// 2. ⭐️ เช็คว่าอัปเดตโดนใครไหม (ถ้าเป็น 0 แปลว่าหา User ID นี้ไม่เจอ)
	if result.RowsAffected == 0 {
		return errors.New("user not found") 
	}

	return nil
}