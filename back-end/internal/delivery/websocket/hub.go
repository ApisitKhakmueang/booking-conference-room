package Websocket

import (
	"context"
	"encoding/json"
	// "log"
	"sync"
	"fmt"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/websocket/v2"
	"github.com/redis/go-redis/v9"
)

type Hub struct {
	// เปลี่ยนจาก uint เป็น string เพื่อให้ยืดหยุ่น (เช่น "booking:1", "notify:uuid-1234")
	rooms        map[string]map[*websocket.Conn]bool
	mu           sync.Mutex
	rdb          *redis.Client
	redisChannel string
}

func NewHub(rdb *redis.Client, channelName string) *Hub {
	return &Hub{
		rooms:        make(map[string]map[*websocket.Conn]bool),
		rdb:          rdb,
		redisChannel: channelName,
	}
}

// ==========================================
// 1. Register (ลงทะเบียนเข้าห้อง/กลุ่ม)
// ==========================================
func (h *Hub) Register(c *websocket.Conn, topic string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// ถ้ายังไม่เคยมีคนเปิดห้องนี้เลย ให้สร้างแผนที่(map)ของห้องนี้ขึ้นมาก่อน
	if h.rooms[topic] == nil {
		h.rooms[topic] = make(map[*websocket.Conn]bool)
	}

	// จับ Client ยัดใส่ห้อง
	h.rooms[topic][c] = true
	// log.Printf("🔌 [Hub] Client joined topic: %s (Total: %d)", topic, len(h.rooms[topic]))
}

// ==========================================
// 2. Unregister (ออกจากห้อง/เตะออก)
// ==========================================
func (h *Hub) Unregister(c *websocket.Conn, topic string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// เช็คว่ามีห้องนี้อยู่ไหม
	if clients, ok := h.rooms[topic]; ok {
		// เช็คว่ามี Client คนนี้อยู่ในห้องจริงๆ ไหม
		if _, exists := clients[c]; exists {
			delete(clients, c) // ลบรายชื่อออก
			c.Close()          // ปิดท่อ
			// log.Printf("❌ [Hub] Client left topic: %s (Remaining: %d)", topic, len(clients))

			// ⭐️ [สำคัญ] ถ้าคนออกไปหมดแล้ว ให้ลบห้องนี้ทิ้งซะ เพื่อคืน RAM ให้ Server!
			if len(clients) == 0 {
				delete(h.rooms, topic)
				// log.Printf("🗑️ [Hub] Topic %s is empty. Deleted to save memory.", topic)
			}
		}
	}
}

// ==========================================
// 3. Broadcast (กระจายข่าวให้คนในห้อง)
// ==========================================
func (h *Hub) Broadcast(topic string, message []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// ดึงรายชื่อคนในห้องนั้นมา
	clients, ok := h.rooms[topic]
	if !ok || len(clients) == 0 {
		return // ไม่มีคนอยู่ ก็ไม่ต้องทำอะไร (ไม่ต้องปรินท์ Error ด้วย)
	}

	// ส่งข้อความให้ทุกคนในห้อง
	for client := range clients {
		if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
			// ถ้าใครท่อขาด/ส่งไม่ผ่าน ก็เตะทิ้งซะ
			client.Close()
			delete(clients, client)
			
			// ⭐️ คืน RAM ถ้าห้องว่าง
			if len(clients) == 0 {
				delete(h.rooms, topic)
			}
		}
	}
}

func (h *Hub) Run(ctx context.Context) {
	pubsub := h.rdb.Subscribe(ctx, h.redisChannel)
	defer pubsub.Close()
	ch := pubsub.Channel()

	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
			// สมมติโครงสร้าง Payload มีทั้ง RoomNumber (จองห้อง) หรือ UserID (แจ้งเตือน)
			var payload domain.WebSocketPayload
			
			if err := json.Unmarshal([]byte(msg.Payload), &payload); err == nil {
				// เช็คว่ามันคือข้อมูลของอันไหน แล้วประกอบชื่อ Topic ให้ตรงกัน
				var topic string
				if payload.Data.RoomNumber != 0 {
					topic = fmt.Sprintf("booking:%d", payload.Data.RoomNumber)
				} else if payload.Data.UserID != "" {
					topic = fmt.Sprintf("user:%s", payload.Data.UserID)
				} else if payload.Data.Status {
					topic = "booking:status"
				}

				// 🚀 สั่ง Broadcast!
				if topic != "" {
					h.Broadcast(topic, []byte(msg.Payload))
				}
			}
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