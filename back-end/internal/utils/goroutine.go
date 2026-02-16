package utils

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

var (
	clients 			= make(map[*websocket.Conn]bool)
	redisChannel 	= "bookings:update"
	mu      			sync.Mutex
)

