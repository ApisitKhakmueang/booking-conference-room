package postgresRepo

import (
	"context"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type configPostgresRepo struct {
	db *gorm.DB
}

func NewConfigPostgresRepo(db *gorm.DB) domain.ConfigPostgresRepo {
	return &configPostgresRepo{db: db}
}

func (p *configPostgresRepo) GetHolidayDB(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	var holidays []domain.Holiday
	
	result := p.db.
		WithContext(ctx). // อย่าลืมใส่ WithContext
		Where("date >= ? AND date <= ?", date.StartStr, date.EndStr).
		Order("date ASC").
		Find(&holidays)

	if result.Error != nil {
		return nil, result.Error
	}

	return holidays, nil
}

func (p *configPostgresRepo) BulkUpsertHolidays(ctx context.Context, holidays []domain.Holiday) error {
	if len(holidays) == 0 {
		return nil
	}

	// ใช้ Batch Upsert เดิมของคุณ ดีมากแล้วครับ
	result := p.db.
		WithContext(ctx).
		Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "date"}}, // เช็คซ้ำที่วันที่
		DoUpdates: clause.AssignmentColumns([]string{"name", "is_day_off", "updated_at"}), // อัปเดตข้อมูลใหม่
	}).Create(&holidays)

	return result.Error
}

func (p *configPostgresRepo) GetConfigDB(ctx context.Context) (*domain.Config, error) {
	config := new(domain.Config)
	err := p.db.WithContext(ctx).First(config).Error
	if err != nil {
		return nil, err
	}
	return config, nil
}

func (p *configPostgresRepo) UpdateConfigDB(ctx context.Context, config *domain.Config) error {
	result := p.db.WithContext(ctx).Model(&domain.Config{}).Where("id = ?", config.ID).Updates(config)
	if result.Error != nil {
		return result.Error
	}
	return nil
}