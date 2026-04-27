package redisRepo

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type bookingRedisRepo struct {
	*BaseRedisRepo
	postgres domain.BookingPostgresRepo
}

func NewBookingRedisRepo(rdb *redis.Client, postgres domain.BookingPostgresRepo) *bookingRedisRepo {
	return &bookingRedisRepo{
		BaseRedisRepo: &BaseRedisRepo{rdb:rdb},
		postgres: postgres,
	}
}

func (r *bookingRedisRepo) CreateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error) {
	booking, err := r.postgres.CreateBookingDB(ctx, booking)
	if err != nil {
		return nil, err
	}

	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, booking.UserID)

	return booking, nil
}

func (r *bookingRedisRepo) UpdateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error) {
	prevRoomNumber, err := r.postgres.GetRoomNumberDB(ctx, booking.ID)
	if err != nil {
		return nil, err
	}

	booking, err = r.postgres.UpdateBookingDB(ctx, booking)
	if err != nil {
		return nil, err
	}

	// 1. ลบ Cache ห้องเก่า (เพื่อให้ข้อมูลที่ย้ายออกหายไป)
	r.DeleteBookingCache(ctx, prevRoomNumber)

	// 2. ลบ Cache ห้องใหม่ (เพื่อให้ข้อมูลที่ย้ายเข้าอัปเดต)
	// ต่อให้ห้องจะเป็นห้องเดิม การสั่ง Delete ซ้ำที่ Key เดิมใน Redis ไม่ทำให้เกิด Error ครับ
	r.DeleteBookingCache(ctx, roomNumber)

	r.DeleteUserCache(ctx, booking.UserID)

	return booking, nil
}

func (r *bookingRedisRepo) DeleteBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error) {
	deletedBooking, err := r.postgres.DeleteBookingDB(ctx, booking);
	if err != nil {
		return nil, err
	}

	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, booking.UserID)
	r.DeleteHistoryCache(ctx, booking.UserID)
	
	return deletedBooking, nil
}

func (r *bookingRedisRepo) CheckOutBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) (*domain.Booking, error) {
	deletedBooking, err := r.postgres.CheckOutBookingDB(ctx, booking);
	if err != nil {
		return nil, err
	}

	r.DeleteBookingCache(ctx, roomNumber)
	r.DeleteUserCache(ctx, booking.UserID)
	r.DeleteHistoryCache(ctx, booking.UserID)
	
	return deletedBooking, nil
}

func (r *bookingRedisRepo) GetBookingByDay(ctx context.Context, date *domain.Date) ([]domain.Booking, error) {
	bookings, err := r.postgres.GetBookingByDayDB(ctx, date)
	if err != nil {
		return nil, err
	}

	return bookings, nil
}

func (r *bookingRedisRepo) GetUpNextBooking(ctx context.Context, endOfDay time.Time) (*domain.Booking, error) {
	booking, err := r.postgres.GetUpNextBookingDB(ctx, endOfDay)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (r *bookingRedisRepo) GetBooking(ctx context.Context, dateTime *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, dateTime.StartStr, dateTime.EndStr)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []domain.Booking
		if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
			return nil, err
		}

		return bookings, nil
	}

	bookings, err := r.postgres.GetBookingDB(ctx, dateTime, roomID)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (r *bookingRedisRepo) GetAnalyticBooking(ctx context.Context, date *domain.Date) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:analytic:%s:%s", date.StartStr, date.EndStr)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []domain.Booking
		if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
			return nil, err
		}

		return bookings, nil
	}

	bookings, err := r.postgres.GetAnalyticBookingDB(ctx, date)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (r *bookingRedisRepo) GetBookingStatus(ctx context.Context) ([]domain.Booking, error) {
	bookings, err := r.postgres.GetBookingStatusDB(ctx)
	if err != nil {
		return nil, err
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return bookings, nil
}

func (r *bookingRedisRepo) GetBookingStatusByRoomID(ctx context.Context, roomID uuid.UUID) (*domain.Booking, error) {
	booking, err := r.postgres.GetBookingStatusByRoomID_DB(ctx, roomID)
	if err != nil {
		return nil, err
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return booking, nil
}

func (r *bookingRedisRepo) GetUserBooking(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:user:%s:date:%s", userID, date)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []domain.Booking
		if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
			return nil, err
		}

		return bookings, nil
	}

	bookings, err := r.postgres.GetUserBookingDB(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return bookings, nil
}

func (r *bookingRedisRepo) GetUserHistory(ctx context.Context, userID uuid.UUID, date string) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("history:user:%s:date:%s", userID, date)

	vals, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []domain.Booking
		if err := json.Unmarshal([]byte(vals), &bookings); err != nil {
			return nil, err
		}

		return bookings, nil
	}

	bookings, err := r.postgres.GetUserHistoryDB(ctx, userID, date)
	if err != nil {
		return nil, err
	}

	if jsonBytes, err := json.Marshal(bookings); err == nil {
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return bookings, nil
}

// Internal Function
func (r *bookingRedisRepo) ClearCacheByPrefix(ctx context.Context,prefix string) error {
	var keys []string

	// วนลูปหา Key ที่ขึ้นต้นด้วย prefix (เช่น "holidays:*")
	// เราใช้ Scan แทน Keys เพราะ Keys จะทำให้ Redis ค้างถ้าข้อมูลเยอะ
	iter := r.rdb.Scan(ctx, 0, prefix+"*", 0).Iterator()
	
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return err
	}

	// ถ้าเจอ Key ก็สั่งลบทีเดียว
	if len(keys) > 0 {
		if err := r.rdb.Del(ctx, keys...).Err(); err != nil {
			return err
		}
	}

	return nil
}

func (r *bookingRedisRepo) SetJsonCache(ctx context.Context, cacheKey string, jsonBytes []byte) {
	err := r.rdb.Set(ctx, cacheKey, jsonBytes, 7*24*time.Hour).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
	}
}

func (r *bookingRedisRepo) DeleteBookingCache(ctx context.Context, roomNumber uint) {
	prefix := fmt.Sprintf("booking:%d", roomNumber)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}

func (r *bookingRedisRepo) DeleteUserCache(ctx context.Context, userID uuid.UUID) {
	prefix := fmt.Sprintf("booking:user:%s", userID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
} 

func (r *bookingRedisRepo) DeleteHistoryCache(ctx context.Context, userID uuid.UUID) {
	prefix := fmt.Sprintf("history:user:%s", userID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
} 

func (r *bookingRedisRepo) DeleteSpecificRoomCache(ctx context.Context, roomID uuid.UUID) {
	prefix := fmt.Sprintf("room:%s", roomID)
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}

func (r *bookingRedisRepo) DeleteRoomDetailsCache(ctx context.Context) {
	prefix := "room:details"
	
	// ⭐️ ใช้ Goroutine แตก Thread ไปทำงานหลังบ้าน
	go func() {
		// 🚨 ข้อควรระวัง: ต้องสร้าง Context ใหม่ (context.Background())
		// เพราะถ้าใช้ ctx เดิม พอ HTTP Request จบ Fiber จะทำลาย ctx ตัวนั้นทิ้ง
		// แล้วทำให้ Redis Scan ตรงนี้พัง (Context Canceled)
		bgCtx := context.Background() 

		err := r.ClearCacheByPrefix(bgCtx, prefix)
		if err != nil {
			// แค่ Print Log ไว้ตรวจสอบ ไม่ต้อง Return Error ให้หน้าบ้านรันช้า
			log.Printf("Failed to clear cache in background for prefix %s: %v", prefix, err)
		}
	}()
}