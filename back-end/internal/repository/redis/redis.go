package Redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain/repository/postgres"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type redisRepository struct {
	rdb 			*redis.Client
	postgres	postgresRepo.PostgresRepository
}

func NewRedisRepository(rdb *redis.Client, postgres postgresRepo.PostgresRepository) *redisRepository {
	return &redisRepository{
		rdb: rdb,
		postgres: postgres,
	}
}

func (r *redisRepository) CreateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	if err := r.postgres.CreateBookingDB(ctx, booking); err != nil {
		return err
	}

	return r.InsertBookingToCache(ctx, booking, roomNumber)
}

func (r *redisRepository) UpdateBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	prevRoomNumber, err := r.postgres.GetRoomNumber(ctx, booking.ID)
	if err != nil {
		return err
	}
	// log.Println("prev room number: ", prevRoomNumber)

	if err := r.DeleteBookingCache(ctx, booking, prevRoomNumber); err != nil {
		return err
	}

	if err := r.postgres.UpdateBookingDB(ctx, booking); err != nil {
		return err
	}

	return r.InsertBookingToCache(ctx, booking, roomNumber)
}

func (r *redisRepository) DeleteBooking(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	if err := r.postgres.DeleteBookingDB(ctx, booking.ID); err != nil {
		return err
	}

	return r.DeleteBookingCache(ctx, booking, roomNumber)
}

func (r *redisRepository) GetBooking(ctx context.Context,dateTime *domain.Date, roomID uuid.UUID, roomNumber uint) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, dateTime.StartStr, dateTime.EndStr)

	vals, err := r.rdb.HVals(ctx, cacheKey).Result()
	if err == nil && len(vals) > 0 {
		var bookings []domain.Booking
		for _, val := range vals {
			var booking domain.Booking
			if err := json.Unmarshal([]byte(val), &booking); err == nil {
				bookings = append(bookings, booking)
			}
		}
		// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
		return bookings, nil
	}

	bookings, err := r.postgres.GetBookingDB(ctx, dateTime, roomID)
	if err != nil {
		return nil, err
	}

	if len(bookings) > 0 {
		// สร้าง Map เพื่อเตรียมข้อมูล (Key = ID, Value = JSON String)
		hashData := make(map[string]interface{})
		
		for _, b := range bookings {
			jsonBytes, _ := json.Marshal(b)
			hashData[b.ID.String()] = jsonBytes // เอา ID ของ Booking เป็นชื่อ Field
		}

		// ใช้ HSet โยน Map เข้าไปทีเดียว! (go-redis v8/v9 รองรับการโยน map ตรงๆ)
		// มันจะกระจาย Field และ Value ลงไปใน Hash ให้อัตโนมัติ (ไวมากๆ)
		if err := r.rdb.HSet(ctx, cacheKey, hashData).Err(); err == nil {
			// ⭐️ สำคัญ: ต้องตั้งเวลาหมดอายุ (TTL) ให้มันด้วย เพื่อไม่ให้ขยะล้น RAM
			// เช่น ให้ Cache นี้อยู่แค่ 1 ชั่วโมง ถ้าไม่มีใครเรียกใช้เลย
			r.rdb.Expire(ctx, cacheKey, 7*24*time.Hour) 
		}
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return bookings, nil
}

func (r *redisRepository) GetBookingStatus(ctx context.Context, timeStart string) ([]domain.Booking, error) {
	cacheKey := fmt.Sprintf("booking:status:%s", timeStart)

	vals, err := r.rdb.HVals(ctx, cacheKey).Result()
	if err == nil && len(vals) > 0 {
		var bookings []domain.Booking
		for _, val := range vals {
			var booking domain.Booking
			if err := json.Unmarshal([]byte(val), &booking); err == nil {
				bookings = append(bookings, booking)
			}
		}
		// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
		return bookings, nil
	}

	bookings, err := r.postgres.GetBookingStatusDB(ctx)
	if err != nil {
		return nil, err
	}

	if len(bookings) > 0 {
		// สร้าง Map เพื่อเตรียมข้อมูล (Key = ID, Value = JSON String)
		hashData := make(map[string]interface{})
		
		for _, b := range bookings {
			jsonBytes, _ := json.Marshal(b)
			hashData[b.ID.String()] = jsonBytes // เอา ID ของ Booking เป็นชื่อ Field
		}

		// ใช้ HSet โยน Map เข้าไปทีเดียว! (go-redis v8/v9 รองรับการโยน map ตรงๆ)
		// มันจะกระจาย Field และ Value ลงไปใน Hash ให้อัตโนมัติ (ไวมากๆ)
		if err := r.rdb.HSet(ctx, cacheKey, hashData).Err(); err == nil {
			// ⭐️ สำคัญ: ต้องตั้งเวลาหมดอายุ (TTL) ให้มันด้วย เพื่อไม่ให้ขยะล้น RAM
			// เช่น ให้ Cache นี้อยู่แค่ 1 ชั่วโมง ถ้าไม่มีใครเรียกใช้เลย
			r.rdb.Expire(ctx, cacheKey, 7*24*time.Hour) 
		}
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return bookings, nil
}

func (r *redisRepository) GetRoomDetails(ctx context.Context) ([]domain.Room, error) {
	cacheKey := "room:details"

	vals, err := r.rdb.HVals(ctx, cacheKey).Result()
	if err == nil && len(vals) > 0 {
		var rooms []domain.Room
		for _, val := range vals {
			var room domain.Room
			if err := json.Unmarshal([]byte(val), &room); err == nil {
				rooms = append(rooms, room)
			}
		}
		// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
		return rooms, nil
	}

	rooms, err := r.postgres.GetRoomDetailsDB(ctx)
	if err != nil {
		return nil, err
	}

	if len(rooms) > 0 {
		// สร้าง Map เพื่อเตรียมข้อมูล (Key = ID, Value = JSON String)
		hashData := make(map[string]interface{})
		
		for _, b := range rooms {
			jsonBytes, _ := json.Marshal(b)
			hashData[b.ID.String()] = jsonBytes // เอา ID ของ Booking เป็นชื่อ Field
		}

		// ใช้ HSet โยน Map เข้าไปทีเดียว! (go-redis v8/v9 รองรับการโยน map ตรงๆ)
		// มันจะกระจาย Field และ Value ลงไปใน Hash ให้อัตโนมัติ (ไวมากๆ)
		if err := r.rdb.HSet(ctx, cacheKey, hashData).Err(); err == nil {
			// ⭐️ สำคัญ: ต้องตั้งเวลาหมดอายุ (TTL) ให้มันด้วย เพื่อไม่ให้ขยะล้น RAM
			// เช่น ให้ Cache นี้อยู่แค่ 1 ชั่วโมง ถ้าไม่มีใครเรียกใช้เลย
			r.rdb.Expire(ctx, cacheKey, 7*24*time.Hour) 
		}
	}

	// คืนค่าข้อมูลที่เพิ่งดึงมาจาก DB ให้ระบบเอาไปใช้ต่อ
	return rooms, nil
}

func (r *redisRepository) GetHoliday(ctx context.Context, date *domain.Date) ([]domain.Holiday, error) {
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	var holidays []domain.Holiday
	val, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		// เจอข้อมูล! (Cache Hit)
		// log.Println("Cache hit")
		
		// แปลง JSON string กลับมาเป็น Struct (Unmarshal)
		if err := json.Unmarshal([]byte(val), &holidays); err == nil {
			// log.Println("Cache HIT: Return data from Redis")
			return holidays, nil
		}
		// ถ้า Unmarshal พัง (เช่น struct เปลี่ยน) ให้ไปโหลด DB ใหม่แทน
	}

	holidays, err = r.postgres.GetHolidayDB(ctx, date)

	if jsonBytes, err := json.Marshal(holidays); err == nil {
		// ตั้ง TTL (เช่น 24 ชั่วโมง เพราะวันหยุดไม่น่าเปลี่ยนบ่อย)
		r.SetJsonCache(ctx, cacheKey, jsonBytes)
	}

	return nil, err
}

func (r *redisRepository) UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID) (*domain.Booking, uint, error) {
	roomNumber, err := r.postgres.GetRoomNumber(ctx, bookingID)
	if err != nil {
		return nil, 0, err
	}

	updateBooking, err := r.postgres.UpdateBookingStatusDB(ctx, bookingID, "complete")
	if err != nil {
		return nil, 0, err
	}

	if err := r.InsertBookingToCache(ctx, updateBooking, roomNumber); err != nil {
		return nil, 0, err
	}

	return updateBooking, roomNumber, nil
}

// HelperRedisRepository methods
func (r *redisRepository) FindHolidaySynced(ctx context.Context, date *domain.Date) int64 {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)

	exists, _ := r.rdb.Exists(ctx, key).Result()
	return exists
}

func (r *redisRepository) SetHolidaySynced(ctx context.Context, date *domain.Date) error {
	key := fmt.Sprintf("sync_flag:holidays:%s:%s", date.StartStr, date.EndStr)
	// ตั้ง TTL ตามความเหมาะสม เช่น 1 วัน หรือ 7 วัน (ถ้า Google Calendar ไม่ได้แก้บ่อย)
	// ข้อมูลใน DB จะถือว่า "สดใหม่" เท่ากับระยะเวลา TTL นี้
	return r.rdb.Set(ctx, key, "1", 7*24*time.Hour).Err()
}

func (r *redisRepository) DeleteHolidayCache(ctx context.Context, date *domain.Date) error {
	// 1. สร้าง Key ให้เหมือนกับตอน Get เป๊ะๆ
	cacheKey := fmt.Sprintf("holidays:%s:%s", date.StartStr, date.EndStr)

	// 2. สั่งลบ (Del)
	if err := r.rdb.Del(ctx, cacheKey).Err(); err != nil {
		return err // หรือจะแค่ log ก็ได้ ถ้าซีเรียส
	}
	return nil
}

// Internal function
func (r *redisRepository) ClearCacheByPrefix(ctx context.Context,prefix string) error {
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

func (r *redisRepository) SetJsonCache(ctx context.Context, cacheKey string, jsonBytes []byte) {
	err := r.rdb.Set(ctx, cacheKey, jsonBytes, 7*24*time.Hour).Err() // TTL ปรับตามความเหมาะสม
	if err != nil {
		// log.Println("Redis Set Error:", err) 
		// Error ตรงนี้ปล่อยผ่านได้ เพราะ User ได้ข้อมูลจาก DB แล้ว
		log.Printf("Failed to set cache: %v", err)
	}
}

func (r *redisRepository) InsertBookingToCache(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	year := booking.StartTime.Year()
	startDateOfYear := fmt.Sprintf("%d-01-01", year)
	endDateOfYear := fmt.Sprintf("%d-12-31", year)
	startDate := booking.StartTime.Format("2006-01-02")

	statusCacheKey := fmt.Sprintf("booking:status:%s", startDate)
	bookingCacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, startDateOfYear, endDateOfYear)
	// log.Println("cache key: ", bookingCacheKey)

	bookingJsonBytes, _ := json.Marshal(booking)
	statusJsonBytes, _ := json.Marshal(booking)

	bookingErr := r.rdb.HSet(ctx, bookingCacheKey, booking.ID.String(), bookingJsonBytes).Err()
	if bookingErr != nil {
		return bookingErr
	}

	statusErr := r.rdb.HSet(ctx, statusCacheKey, booking.ID.String(), statusJsonBytes).Err()
	if statusErr != nil {
		return statusErr
	}

	return nil
}

func (r *redisRepository) DeleteBookingCache(ctx context.Context, booking *domain.Booking, roomNumber uint) error {
	year := booking.StartTime.Year()
	startDate := fmt.Sprintf("%d-01-01", year)
	endDate := fmt.Sprintf("%d-12-31", year)

	cacheKey := fmt.Sprintf("booking:%d:%s:%s", roomNumber, startDate, endDate)
	// log.Println("delete cache key: ", cacheKey)
	// log.Println("booking id: ", booking.ID.String())

	return r.rdb.HDel(ctx, cacheKey, booking.ID.String()).Err()
}