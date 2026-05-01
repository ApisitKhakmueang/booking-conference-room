package domain

import "github.com/hibiken/asynq"

// สร้าง Interface เพื่อให้ Mock ได้ง่าย
type AsynqQueue interface {
	Enqueue(task *asynq.Task, opts ...asynq.Option) (*asynq.TaskInfo, error)
	Close() error
}