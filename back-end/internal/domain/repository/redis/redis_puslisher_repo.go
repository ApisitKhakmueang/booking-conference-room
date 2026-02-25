package redisRepo

import "context"

type RealtimePublisher interface {
	PublishEvent(ctx context.Context, channelName string, event string, payload interface{}) error
}