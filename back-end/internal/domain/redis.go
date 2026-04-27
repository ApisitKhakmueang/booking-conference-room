package domain

import "context"

type RealtimePublisher interface {
	PublishEvent(ctx context.Context, event string, payload interface{}) error
}