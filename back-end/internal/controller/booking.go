package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/http"

	"github.com/gofiber/fiber/v2"
)

func InitialBookingRoute(router fiber.Router, handler *http.OrderHandler) {
	booking := router.Group("/booking") // สร้าง Group ย่อย /users
    
	// กำหนด endpoints
	booking.Post("/:id", handler.CreateBooking)
	booking.Put("/:bookingID", handler.UpdateBooking)
	booking.Delete("/:bookingID", handler.DeleteBooking)
	booking.Get("/:date", handler.GetBooking)
	// booking.Get("/user/:id", handler.GetUserBooking)
}