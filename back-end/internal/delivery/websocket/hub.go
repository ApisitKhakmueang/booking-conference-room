package Websocket

import (
	"context"
	"sync"
	"encoding/json"
	"log"

	"github.com/gofiber/websocket/v2"
	"github.com/redis/go-redis/v9"
)

type Hub struct {
    // เปลี่ยนจาก map[*websocket.Conn]bool เป็น:
	rooms map[uint]map[*websocket.Conn]bool // map[roomNumber]map[clients]
	mu    sync.Mutex
	rdb   *redis.Client
}

func NewHub(rdb *redis.Client) *Hub {
	return &Hub{
		rooms: make(map[uint]map[*websocket.Conn]bool),
		rdb:   rdb,
	}
}

// ตอน Register ต้องรับเลขห้องมาด้วย
func (h *Hub) Register(c *websocket.Conn, roomNumber uint) {
	h.mu.Lock()
	defer h.mu.Unlock()
	
	if h.rooms[roomNumber] == nil {
		h.rooms[roomNumber] = make(map[*websocket.Conn]bool)
	}
	h.rooms[roomNumber][c] = true
}

func (h *Hub) Unregister(c *websocket.Conn, roomNumber uint) {
	h.mu.Lock()
	defer h.mu.Unlock()
	
	if _, ok := h.rooms[roomNumber][c]; ok {
		delete(h.rooms[roomNumber], c)
		c.Close()
	}
}

func (h *Hub) Run(ctx context.Context) {
	log.Println("Hub started, listening to Redis...")
	pubsub := h.rdb.Subscribe(ctx, "bookings_realtime")
	defer pubsub.Close()
	ch := pubsub.Channel()

	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
            // 1. แปลงข้อความจาก Redis เป็น Struct เพื่ออ่านค่า RoomNumber
            // โครงสร้างที่เรา Publish มาคือ {"type": "...", "data": {"id": 1, "room_number": 1, ...}}
			log.Println("Received message from Redis:", msg.Payload)
			var payload struct {
				Type string `json:"type"`
				Data struct {
					RoomNumber uint `json:"room_number"`
				} `json:"data"`
			}
			
			if err := json.Unmarshal([]byte(msg.Payload), &payload); err == nil {
				// 2. เรียกฟังก์ชัน Broadcast แบบเจาะจงห้อง
				log.Printf("Payload: %+v\n", payload)
				h.broadcastToRoom(payload.Data.RoomNumber, []byte(msg.Payload))
			}
		}
	}
}

// แจกจ่ายข้อความเฉพาะคนที่ดูห้องนั้นๆ
func (h *Hub) broadcastToRoom(roomNumber uint, message []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

    // ดึงรายชื่อ Client ทั้งหมดที่กำลังดูห้องนี้อยู่
	clients := h.rooms[roomNumber]
	log.Println("clients: ", h.rooms)
	for client := range clients {
        // ยัดข้อมูลใหม่ใส่ท่อ WebSocket กลับไปหา Frontend
		log.Printf("Broadcasting to room %d: %s", roomNumber, string(message))
		if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
			client.Close()
			delete(h.rooms[roomNumber], client)
		}
	}
}

// type Hub struct {
// 	clients map[*websocket.Conn]bool // เก็บรายการคนที่ต่อ WS อยู่
// 	mu      sync.Mutex
// 	rdb     *redis.Client
// }

// func NewHub(rdb *redis.Client) *Hub {
// 	return &Hub{
// 		clients: make(map[*websocket.Conn]bool),
// 		rdb:     rdb,
// 	}
// }

// func (h *Hub) Register(c *websocket.Conn) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	h.clients[c] = true
// 	log.Println("New client connected")
// }

// func (h *Hub) Unregister(c *websocket.Conn) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	if _, ok := h.clients[c]; ok {
// 		delete(h.clients, c)
// 		c.Close()
// 		log.Println("Client disconnected")
// 	}
// }

// // Run: รันใน Background (Goroutine)
// func (h *Hub) Run(ctx context.Context) {
// 	log.Println("Hub started, listening to Redis...")

// 	// 1. Subscribe Redis Channel
// 	pubsub := h.rdb.Subscribe(ctx, "bookings_realtime")
// 	defer pubsub.Close()
	
// 	ch := pubsub.Channel()

// 	for {
// 		select {
// 		case <-ctx.Done(): // Graceful Shutdown
// 			return
// 		case msg := <-ch: // ได้รับข้อความจาก Redis
// 			// 2. Broadcast หาทุกคนที่ต่อ WS อยู่
// 			h.broadcast([]byte(msg.Payload))
// 		}
// 	}
// }

// func (h *Hub) broadcast(message []byte) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()

// 	for client := range h.clients {
// 		// ส่งข้อความไปหา Client
// 		if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
// 			log.Println("Write error:", err)
// 			client.Close()
// 			delete(h.clients, client)
// 		}
// 	}
// }