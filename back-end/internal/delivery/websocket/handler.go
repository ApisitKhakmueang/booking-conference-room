package Websocket

import (
	"context"
	"fmt"
	"strconv"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
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

	topic := fmt.Sprintf("booking:%d", roomNumber)

	w.hub.Register(c, topic)
	defer w.hub.Unregister(c, topic)

	date := new(domain.Date)

	// 3. สั่ง Parser (มันจะทับค่า Default เฉพาะตัวที่ส่งมาถูกต้อง)
	// ถ้าส่ง ?year=-5 มันจะ Parse ไม่ผ่าน และใช้ค่า Default (หรือเป็น 0) ให้เอง
	startDate, endDate := c.Query("startDate"), c.Query("endDate")
	date.StartStr = startDate
	date.EndStr = endDate
	if date.StartStr == "" || date.EndStr == "" {
		c.WriteJSON(map[string]string{"error": "Please send startDate and endDate"})
		return 
	}

	// log.Printf("duration: %s, room: %v", filter.Duration, filter.Room)
	
	if roomNumber == 0 {
		c.WriteJSON(map[string]string{"error": "Please send room number"})
		return 
	}

	response, err := w.usecase.GetBooking(ctx, date, uint(roomNumber))
	
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

func (w *WSBookingHandler) GetBookingStatus(c *websocket.Conn) {
	ctx := context.Background()

	topic := "booking:status"

	w.hub.Register(c, topic)
	defer w.hub.Unregister(c, topic)

	response, err := w.usecase.GetBookingStatus(ctx)

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

func (w *WSBookingHandler) GetSingleBookingStatus(c *websocket.Conn) {
	ctx := context.Background()
	roomID, err := uuid.Parse(c.Params("roomID"))
	if err != nil {
		c.WriteJSON(map[string]string{"error": err.Error()})
	}

	topic := fmt.Sprintf("booking:status:%d", roomID)

	w.hub.Register(c, topic)
	defer w.hub.Unregister(c, topic)

	response, err := w.usecase.GetSingleBookingStatus(ctx, roomID)

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