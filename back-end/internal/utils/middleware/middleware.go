package middleware

import (
	"context"
	"log"
	"strings"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/nedpals/supabase-go"
)

func AuthMiddleware(client *supabase.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		user, err := client.Auth.User(c.Context(), token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
		}
		
		c.Locals("user_id", user.ID)
		return c.Next()
	}
}

func WebsocketMiddleware(c *fiber.Ctx) error {
	// เช็คว่า Header มีการขอ Upgrade เป็น WebSocket ไหม?
	if websocket.IsWebSocketUpgrade(c) {
			
		// ถ้าใช่: ให้ผ่านเข้าไปที่ Handler ถัดไปได้ (c.Next)
		// (สามารถฝากตัวแปรผ่าน c.Locals ได้ด้วย เผื่อเอาไปใช้ต่อ)
		c.Locals("allowed", true) 
		return c.Next()
	}

	// ถ้าไม่ใช่: (เช่น ยิง GET ธรรมดามา) 
	// ให้เตะออกและตอบกลับเป็น HTTP Status 426 (Upgrade Required)
	return fiber.ErrUpgradeRequired
}

// ประกาศ Type สำหรับ Handler ของแต่ละ Endpoint ที่จะมารับช่วงต่อ
// โดยจะส่ง Connection, User ID และ ข้อความที่แกะแล้ว ไปให้ใช้งานเลย
// type WSHandlerFunc func(c *websocket.Conn, userID string, msg domain.WSMessage)

// ฟังก์ชันแม่: ทำหน้าที่ตรวจ Auth ก่อน
// func WithWSAuth(client *supabase.Client, next WSHandlerFunc) func(*websocket.Conn) {
func WithWSAuth(client *supabase.Client, next func(c *websocket.Conn)) func(*websocket.Conn) {
	return func(c *websocket.Conn) {
		var userID string
		isAuthenticated := false

		// Loop รับข้อความเริ่มต้นที่นี่
		for {
			var msg domain.WSMessage
			if err := c.ReadJSON(&msg); err != nil {
				log.Println("WS Error/Closed:", err)
				break
			}

			// ด่านที่ 1: ตรวจสอบ Auth (ทำครั้งแรกครั้งเดียว)
			if !isAuthenticated {
				if msg.Type == "auth" {
					// หมายเหตุ: ใช้ context.Background() สำหรับยิง API ทั่วไปใน WS
					user, err := client.Auth.User(context.Background(), msg.Token) 
					if err != nil {
						c.WriteJSON(fiber.Map{"error": "Authentication failed"})
						c.Close()
						return
					}
					
					isAuthenticated = true
					userID = user.ID
					c.WriteJSON(domain.WSMessage{Type: "system", Data: "Authenticated successfully!"})
					log.Println("User Authenticated in WS:", userID)
					continue // วนลูปกลับไปรอรับข้อความถัดไป (ข้ามด่านที่ 2 ไปก่อน)
				} else {
					c.WriteJSON(fiber.Map{"error": "Please authenticate first"})
					c.Close()
					return
				}
			}

			next(c)
		}
	}
}