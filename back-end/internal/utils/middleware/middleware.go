package middleware

import (
	"github.com/gofiber/websocket/v2"
	"github.com/gofiber/fiber/v2"
)

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