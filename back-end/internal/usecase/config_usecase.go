package usecase

import (
	"context"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
)

type configUsecase struct {
	cache          domain.ConfigRedisRepo // เรียกผ่าน Interface
	db domain.ConfigPostgresRepo // เรียกผ่าน Interface
	gateway        domain.ConfigGateWay
}

// NewBookingUsecase คือ Constructor
func NewConfiggUsecase(
	cache 		domain.ConfigRedisRepo,
	db 				domain.ConfigPostgresRepo,
	gateway 	domain.ConfigGateWay,) domain.ConfigUsecase {
	return &configUsecase{
		cache:   	cache,
		db: 			db,
		gateway:	gateway,
	}
}

func (u *configUsecase) GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	// 	// loc := time.FixedZone("ICT", 7*60*60)
	// 	// startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
	// 	// endDate := startDate.AddDate(0, 1, -1) // วันสุดท้ายของเดือน

	// 	// 3. หาว่าวันที่เท่าไหร่บ้างที่เป็น เสาร์(6)-อาทิตย์(0)

	now := time.Now()

	// 2. ใช้ Format มาตรฐาน (2006-01-02 คือสูตรลับของ Go ห้ามเปลี่ยนเลข)
	layout := "2006-01-02"

	// StartDate: วันนี้
	if date.StartStr == "" {
		date.StartStr = now.Format(layout)
	}

	// 3. EndDate: ใช้ AddDate(ปี, เดือน, วัน)
	// Go จะจัดการเรื่อง เดือน 12 -> 1 หรือ ปีอธิกสุรทิน ให้เองอัตโนมัติ
	if date.EndStr == "" {
		nextMonth := now.AddDate(0, 1, 0)
		date.EndStr = nextMonth.Format(layout)
	}

	isSynced := u.cache.FindHolidaySynced(ctx, date)

	if isSynced > 0 {
		// ถ้า Sync แล้ว -> ดึงจาก DB ได้เลย มั่นใจได้ว่าข้อมูลครบ
		holidays, err := u.cache.GetHoliday(ctx, date)
		if err != nil {
			return nil, err
		}
		// ถ้า DB ว่างเปล่า (len=0) ก็แปลว่าเดือนนั้นไม่มีวันหยุดจริงๆ (เพราะ Sync มาแล้ว)
		// ดังนั้น return ได้เลย
		return holidays, nil
	}

	googleHolidays, err := u.gateway.FetchHolidays(date)
	if err != nil {
		// กรณีต่อ Google ไม่ได้ ให้ลองไปดึงของเก่าจาก DB มาใช้แก้ขัดไปก่อน (Fallback)
		fallbackHolidays, dbErr := u.cache.GetHoliday(ctx, date)
		if dbErr == nil && len(fallbackHolidays) > 0 {
			return fallbackHolidays, nil // ดีกว่า return error
		}
		return nil, err
	}

	// 	// log.Printf("BEFORE INSERT: First=%v, Last=%v\n", googleHolidays[0].Date.Time(), googleHolidays[len(googleHolidays)-1].Date.Time())

	// 	// 5. บันทึกสิ่งที่ได้ลง DB (Save for next time)
	// 	// แนะนำให้ใช้ Batch Insert (Create ทีเดียวหลาย row)
	if len(googleHolidays) > 0 {
		if err := u.db.BulkUpsertHolidays(ctx, googleHolidays); err != nil {
			// Log error ไว้ แต่ไม่ต้อง return error ก็ได้
			// เพราะเรามี data ส่งให้ user แล้ว (แค่ cache ไม่สำเร็จ)
			log.Println("Failed to cache holidays:", err)
		}

		if err := u.cache.DeleteHolidayCache(ctx, date); err != nil {
			return nil, err
		}
	}

	if err := u.cache.SetHolidaySynced(ctx, date); err != nil {
		log.Println("Failed to set sync flag:", err)
	}

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