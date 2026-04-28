package domain

import (
	"context"
	"time"
)

type RealtimePublisher interface {
	PublishEvent(ctx context.Context, event string, payload any) error
}

// ⭐️ สร้าง Interface แม่สำหรับ Redis
type RedisCacheRepository interface {
	SetCache(ctx context.Context, cacheKey string, data any, expiration time.Duration)
	GetCache(ctx context.Context, cacheKey string, dest any) error
}