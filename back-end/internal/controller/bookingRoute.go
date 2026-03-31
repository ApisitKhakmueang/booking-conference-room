package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"

	"github.com/gofiber/fiber/v2"
	// "github.com/gofiber/websocket/v2"
)

func InitialBookingRoute(router fiber.Router, handler *http.BookingHandler) {
	// กำหนด endpoints
	router.Post("/:userID", handler.CreateBooking)
	router.Put("/:bookingID", handler.UpdateBooking)
	router.Delete("/:bookingID", handler.DeleteBooking)
	// router.Get("/:room", websocket.New(ws.GetBooking))
	// router.Get("/:room", handler.GetBooking)
	router.Get("/user/:userID", handler.GetUserBooking)
	router.Get("/history/:userID", handler.GetUserHistory)
}
