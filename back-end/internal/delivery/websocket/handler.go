package Websocket

import (
	"context"
	"strconv"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/websocket/v2"
)

// สร้าง Struct เก็บ Dependency ที่จำเป็น
type WSBookingHandler struct {
	hub     *Hub
	usecase domain.BookingUsecase
}

// Constructor รับค่าเข้ามา
func NewWSBookingHandler(hub *Hub, usecase domain.BookingUsecase) *WSBookingHandler {
	return &WSBookingHandler{
		hub:     hub,
		usecase: usecase,
	}
}

func (w *WSBookingHandler) GetBooking(c *websocket.Conn) {
	ctx := context.Background()
	roomNumber, err := strconv.Atoi(c.Params("room"))
	if err != nil {
		c.WriteJSON(map[string]string{"error": err.Error()})
	}

	w.hub.Register(c, uint(roomNumber))
	defer w.hub.Unregister(c, uint(roomNumber))

	q := new(domain.Date)

	// 3. สั่ง Parser (มันจะทับค่า Default เฉพาะตัวที่ส่งมาถูกต้อง)
	// ถ้าส่ง ?year=-5 มันจะ Parse ไม่ผ่าน และใช้ค่า Default (หรือเป็น 0) ให้เอง
	startDate, endDate := c.Query("startDate"), c.Query("endDate")
	q.StartStr = startDate
	q.EndStr = endDate
	if q.StartStr == "" || q.EndStr == "" {
		c.WriteJSON(map[string]string{"error": "Please send startDate and endDate"})
	}

	// log.Printf("duration: %s, room: %v", filter.Duration, filter.Room)
	
	if roomNumber == 0 {
		c.WriteJSON(map[string]string{"error": "Please send room number"})
	}

	response, err := w.usecase.GetBooking(ctx, q, uint(roomNumber))
	
	if err == nil {
		payload := map[string]interface{}{
			"type": "initial_data",
			"data": response,
		}
		if err := c.WriteJSON(payload); err != nil {
			return
		}
	} else {
		c.WriteJSON(map[string]string{"error": err.Error()})
	}

	for {
		if _, _, err := c.ReadMessage(); err != nil {
			break
		}
	}
}