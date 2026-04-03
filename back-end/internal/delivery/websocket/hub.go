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
      var payload domain.WebSocketPayload
      
      if err := json.Unmarshal([]byte(msg.Payload), &payload); err == nil {
        
        // ⭐️ เปลี่ยนจาก if-else เป็นการเก็บ Array ของ Topic ที่ต้องส่ง
        var topicsToNotify []string

        // 1. ถ้ามีห้อง ให้แจ้งเตือนห้องนั้น
        if payload.Data.RoomNumber != 0 {
          topicsToNotify = append(topicsToNotify, fmt.Sprintf("booking:%d", payload.Data.RoomNumber))
        }
        
        // 2. ถ้ามี User ให้แจ้งเตือน User คนนั้น (เช่น แจ้งเตือนส่วนตัว)
        if payload.Data.UserID != "" {
          topicsToNotify = append(topicsToNotify, fmt.Sprintf("user:%s", payload.Data.UserID))
        }
        
        // 3. แจ้งเตือนหน้า Status รวม (คุณอาจจะต้องเช็คว่า Event นี้เกี่ยวกับหน้า Status ไหม)
        // หมายเหตุ: เช็ค type ของ payload.Data.Status ด้วยนะครับว่าเป็น string หรือ bool
        if payload.Data.Status { // สมมติว่าเป็น String ("confirm", "cancelled")
          topicsToNotify = append(topicsToNotify, "booking:status")
        }

        // 🚀 สั่ง Broadcast ไปยังทุก Topic ที่เกี่ยวข้อง
        for _, topic := range topicsToNotify {
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