package usecase

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

type configUsecase struct {
	BaseUsecase
	cache          domain.ConfigRedisRepo // เรียกผ่าน Interface
	db domain.ConfigPostgresRepo // เรียกผ่าน Interface
	gateway        domain.ConfigGateWay
}

// NewBookingUsecase คือ Constructor
func NewConfigUsecase(
	pub				domain.RealtimePublisher,
	cache 		domain.ConfigRedisRepo,
	db 				domain.ConfigPostgresRepo,
	gateway 	domain.ConfigGateWay,) domain.ConfigUsecase {
	return &configUsecase{
		BaseUsecase: 	NewBaseUsecase(pub),
		cache:   			cache,
		db: 					db,
		gateway:			gateway,
	}
}

func (u *configUsecase) GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	now := time.Now()
	layout := "2006-01-02"

	if date.StartStr == "" {
		date.StartStr = now.Format(layout)
	}
	if date.EndStr == "" {
		nextMonth := now.AddDate(0, 1, 0)
		date.EndStr = nextMonth.Format(layout)
	}

	// ⭐️ สร้าง cacheKey ไว้ใช้ร่วมกันทั้ง 2 ฝั่งเลย
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)
	isSynced := u.cache.FindHolidaySynced(ctx, date)

	// ==========================================
	// กรณีที่ 1: SYNC แล้ว (ดึงข้อมูลจาก Cache หรือ DB)
	// ==========================================
	if isSynced > 0 {
		var holidays []domain.Holiday
		err := u.cache.GetCache(ctx, cacheKey, &holidays)

		if err != nil {
			// ดึงจาก Postgres
			holidays, err = u.db.GetHolidayDB(ctx, date)
			if err != nil {
				return nil, err
			}

			u.RunInBackground(5*time.Second, func(bgCtx context.Context) {
				u.cache.SetCache(bgCtx, cacheKey, holidays, 7*24*time.Hour) // เก็บไว้ 7 วัน (หรือปรับตามเหมาะสม)
			})
		}
		return holidays, nil
	}

	// ==========================================
	// กรณีที่ 2: ยังไม่เคย SYNC (ดึง Google API แล้วอัปเดต DB/Cache)
	// ==========================================
	googleHolidays, err := u.gateway.FetchHolidays(date)
	if err != nil {
		// ✅ แก้ไข: ดึงจาก DB ตามที่ Comment แจ้งไว้
		fallbackHolidays, dbErr := u.db.GetHolidayDB(ctx, date)
		if dbErr == nil && len(fallbackHolidays) > 0 {
			return fallbackHolidays, nil
		}
		return nil, err
	}

	// Save ลง DB ทันที (ให้จบในเส้นทางหลัก)
	if len(googleHolidays) > 0 {
		if err := u.db.BulkUpsertHolidays(ctx, googleHolidays); err != nil {
			log.Println("Failed to save holidays to DB:", err)
		}
	}

	// 🌟 ท่าไม้ตาย: โยนการอัปเดต Cache และการ Set Sync Flag เข้า Background ให้หมด!
	u.RunInBackground(5*time.Second, func(bgCtx context.Context) {
		// ถ้ามีวันหยุด ก็อัปเดตข้อมูลสดใหม่ลง Cache ไปเลย
		if len(googleHolidays) > 0 {
			u.cache.SetCache(bgCtx, cacheKey, googleHolidays, 7*24*time.Hour)
		}
		
		// Set Sync Flag (ถึงแม้เดือนนั้นจะไม่มีวันหยุด ก็ต้อง Set ไว้ ระบบจะได้ไม่ไปกวน Google API บ่อยๆ)
		if err := u.cache.SetHolidaySynced(bgCtx, date); err != nil {
			log.Println("Failed to set sync flag:", err)
		}
	})

	return googleHolidays, nil
}

func (u *configUsecase) GetConfig(ctx context.Context) (*domain.Config, error) {
	config, err := u.db.GetConfigDB(ctx)
	if err != nil {
		return nil, err
	}

	return config, nil
}

func (u *configUsecase) UpdateConfig(ctx context.Context, config *domain.Config) error {
	if err := u.db.UpdateConfigDB(ctx, config); err != nil {
		return err
	}

	return nil
}