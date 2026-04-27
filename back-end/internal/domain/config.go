package domain

import "context"

type ConfigUsecase interface {
	GetHoliday(ctx context.Context, date *Date) ([]Holiday, error)
	GetConfig(ctx context.Context) (*Config, error)
	UpdateConfig(ctx context.Context, config *Config) error
}

type ConfigGateWay interface {
	FetchHolidays(date *Date) ([]Holiday, error)
}

type ConfigRedisRepo interface {
	GetHoliday(ctx context.Context, date *Date) ([]Holiday, error)
	FindHolidaySynced(ctx context.Context, date *Date) int64
	SetHolidaySynced(ctx context.Context, date *Date) error
	DeleteHolidayCache(ctx context.Context, date *Date) error
}

type ConfigPostgresRepo interface {
	GetHolidayDB(ctx context.Context, date *Date) ([]Holiday, error)
	BulkUpsertHolidays(ctx context.Context, holidays []Holiday) error
	GetConfigDB(ctx context.Context) (*Config, error)
	UpdateConfigDB(ctx context.Context, config *Config) error
}
