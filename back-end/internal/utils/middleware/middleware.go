package middleware

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/nedpals/supabase-go"

	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() fiber.Handler {
	var jwtSecret = []byte(os.Getenv("SUPABASE_JWT_SECRET"))
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// 🌟 แกะ Token โดยตรงด้วย JWT Secret
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
		}

		// 🌟 ดึงข้อมูลจาก Payload โดยตรง
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// ดึง User ID
			userID := claims["sub"].(string)
			
			// ดึง app_metadata ออกมาดูเลย!
			if appMetadata, ok := claims["app_metadata"].(map[string]interface{}); ok {
				// log.Printf("AppMetadata ที่แกะได้: %v", appMetadata)
				
				if role, exists := appMetadata["role"]; exists {
					// log.Printf("Role ของคนนี้คือ: %v", role)
					log.Println("role: ", role)
					c.Locals("role", role) // เก็บ role ไว้ใช้ต่อใน API
				}

				if status, exists := appMetadata["status"]; exists {
					// log.Printf("Role ของคนนี้คือ: %v", status)
					if status == "inactive" {
						return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Account has been suspended."})
					}
				}
			}

			c.Locals("user_id", userID)
			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid claims"})
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
		// var userID string

		// Loop รับข้อความเริ่มต้นที่นี่
		var msg domain.WSMessage
		if err := c.ReadJSON(&msg); err != nil {
			log.Println("WS Error/Closed:", err)
			return
		}

		// ด่านที่ 1: ตรวจสอบ Auth (ทำครั้งแรกครั้งเดียว)
		if msg.Type == "auth" {
			// log.Println("token: ", msg.Token)
			// หมายเหตุ: ใช้ context.Background() สำหรับยิง API ทั่วไปใน WS
			_, err := client.Auth.User(context.Background(), msg.Token) 
			if err != nil {
				c.WriteJSON(fiber.Map{"error": "Authentication failed"})
				c.Close()
				return
			}
			
			// userID = user.ID
			// c.Locals("user_id", user.ID)
			c.WriteJSON(domain.WSMessage{Type: "system", Data: "Authenticated successfully!"})
			// log.Println("User Authenticated in WS:", userID)
			next(c)
			return
		} else {
			c.WriteJSON(fiber.Map{"error": "Please authenticate first"})
			c.Close()
			return
		}
	}
}