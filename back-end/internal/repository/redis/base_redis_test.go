package redisRepo

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/go-redis/redismock/v9"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

func TestSetCache(t *testing.T) {
	// 1. สร้าง Mock Client และ Mock Controller
	db, mock := redismock.NewClientMock()
	
	// จำลอง Repo โดยใช้ Mock DB
	repo := &BaseRedisRepo{
		rdb: db,
	}

	ctx := context.Background()
	cacheKey := "test_key"
	testData := map[string]string{"message": "hello redis"}
	expiration := 10 * time.Minute

	// แปลงข้อมูลเป็น JSON ไว้รอเทียบ (เพราะในฟังก์ชันมีการ Marshal)
	expectedJson, _ := json.Marshal(testData)

	t.Run("Successful SetCache", func(t *testing.T) {
		// 2. ตั้งความคาดหวัง (Expectation)
		// คาดหวังว่าคำสั่ง Set จะถูกเรียกด้วย Key, Value และ Expiration ที่ถูกต้อง
		mock.ExpectSet(cacheKey, expectedJson, expiration).SetVal("OK")

		// 3. รันฟังก์ชัน
		repo.SetCache(ctx, cacheKey, testData, expiration)

		// 4. ตรวจสอบว่าคำสั่งถูกเรียกตามที่นัดกันไว้ไหม
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Redis Set Error", func(t *testing.T) {
		// จำลองว่า Redis พ่น Error ออกมา
		mock.ExpectSet(cacheKey, expectedJson, expiration).SetErr(assert.AnError)

		// รันฟังก์ชัน (ฟังก์ชันนี้ไม่คืน Error แต่จะ Log แทน)
		repo.SetCache(ctx, cacheKey, testData, expiration)

		// ตรวจสอบว่าเรียกครบตามที่คาดไว้หรือไม่
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGetCache(t *testing.T) {
	db, mock := redismock.NewClientMock()
	repo := &BaseRedisRepo{rdb: db}
	ctx := context.Background()
	cacheKey := "test_booking_1"

	// เตรียม Struct ตัวอย่างสำหรับรับค่า
	type SampleData struct {
		ID    string `json:"id"`
		Title string `json:"title"`
	}

	t.Run("Successful GetCache", func(t *testing.T) {
		expectedData := SampleData{ID: "123", Title: "Meeting Room A"}
		jsonData, _ := json.Marshal(expectedData)

		// ⭐️ Mock: คืนค่าเป็น String JSON
		mock.ExpectGet(cacheKey).SetVal(string(jsonData))

		var result SampleData
		err := repo.GetCache(ctx, cacheKey, &result)

		assert.NoError(t, err)
		assert.Equal(t, expectedData.ID, result.ID)
		assert.Equal(t, expectedData.Title, result.Title)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Cache Miss (Key Not Found)", func(t *testing.T) {
		// ⭐️ Mock: เมื่อหาไม่เจอ Redis จะคืนค่า redis.Nil
		mock.ExpectGet(cacheKey).SetErr(redis.Nil)

		var result SampleData
		err := repo.GetCache(ctx, cacheKey, &result)

		assert.Error(t, err)
		assert.True(t, errors.Is(err, redis.Nil)) // ต้องเช็คได้ว่าเป็น redis.Nil
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Invalid JSON Format", func(t *testing.T) {
		// ⭐️ Mock: คืนค่าที่เขียน JSON ผิด
		mock.ExpectGet(cacheKey).SetVal("invalid-json-content")

		var result SampleData
		err := repo.GetCache(ctx, cacheKey, &result)

		// ต้องเกิด Error จากตอน Unmarshal
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid character") 
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestClearCacheByPrefix(t *testing.T) {
	db, mock := redismock.NewClientMock()
	repo := &BaseRedisRepo{rdb: db}
	ctx := context.Background()
	prefix := "holidays"

	t.Run("Success - found keys and delete", func(t *testing.T) {
		keys := []string{"holidays:1", "holidays:2"}
		
		// 1. Mock การ Scan: คืนค่าคีย์ที่เจอ
		// พารามิเตอร์: cursor (0), match (prefix+"*"), count (0)
		mock.ExpectScan(0, prefix+"*", 0).SetVal(keys, 0)
		
		// 2. Mock การ Del: คาดหวังว่าจะถูกเรียกด้วยคีย์ทั้งหมดที่เจอ
		mock.ExpectDel(keys...).SetVal(int64(len(keys)))

		err := repo.ClearCacheByPrefix(ctx, prefix)

		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Success - no keys found", func(t *testing.T) {
		mock.ExpectScan(0, prefix+"*", 0).SetVal([]string{}, 0)
		
		// ไม่มีการเรียก Del เพราะโค้ดเช็ค len(keys) > 0

		err := repo.ClearCacheByPrefix(ctx, prefix)

		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Error - Scan fails", func(t *testing.T) {
		mock.ExpectScan(0, prefix+"*", 0).SetErr(errors.New("scan error"))

		err := repo.ClearCacheByPrefix(ctx, prefix)

		assert.Error(t, err)
		assert.Equal(t, "scan error", err.Error())
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestDeleteCache(t *testing.T) {
	db, mock := redismock.NewClientMock()
	repo := &BaseRedisRepo{rdb: db}
	ctx := context.Background()
	prefix := "bookings"

	t.Run("Success - trigger background deletion", func(t *testing.T) {
		keys := []string{"bookings:1"}
		
		// ตั้งความคาดหวังสำหรับ Logic ภายใน ClearCacheByPrefix
		mock.ExpectScan(0, prefix+"*", 0).SetVal(keys, 0)
		mock.ExpectDel(keys...).SetVal(1)

		// เรียกฟังก์ชัน (จะรัน go func ทันที)
		repo.DeleteCache(ctx, prefix)

		// 🚨 สำคัญ: เนื่องจากเป็น Goroutine ต้องหยุดรอเล็กน้อยเพื่อให้งานทำงานเสร็จก่อนเช็ค Expectation
		time.Sleep(50 * time.Millisecond)

		assert.NoError(t, mock.ExpectationsWereMet())
	})
}