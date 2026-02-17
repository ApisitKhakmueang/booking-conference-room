package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"

	"github.com/gofiber/fiber/v2"
	// "github.com/gofiber/websocket/v2"
)

func InitialBookingRoute(router fiber.Router, handler *http.BookingHandler) {
	booking := router.Group("/booking") // สร้าง Group ย่อย /users
    
	// กำหนด endpoints
	booking.Post("/:id", handler.CreateBooking)
	booking.Put("/:bookingID", handler.UpdateBooking)
	booking.Delete("/:bookingID", handler.DeleteBooking)
	// booking.Get("/:room", websocket.New(ws.GetBooking))
	// booking.Get("/:room", handler.GetBooking)
	// booking.Get("/user/:id", handler.GetUserBooking)
}