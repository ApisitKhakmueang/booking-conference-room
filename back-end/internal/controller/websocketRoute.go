package controller

import (
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/middleware"
	"github.com/nedpals/supabase-go"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func InitialWSRoute(router fiber.Router, ws *Websocket.WSBookingHandler, supabaseClient *supabase.Client) {
	// กำหนด endpoints
	// router.Post("/:id", handler.CreateBooking)
	// router.Put("/:bookingID", handler.UpdateBooking)
	// router.Delete("/:bookingID", handler.DeleteBooking)
	router.Get("/status", websocket.New(ws.GetBookingStatus))
	router.Get("/:room", websocket.New(middleware.WithWSAuth(supabaseClient, ws.GetBooking)))
	// router.Get("/:room", handler.GetBooking)
	// router.Get("/user/:id", handler.GetUserBooking)
}