package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/utils/middleware"
	"github.com/nedpals/supabase-go"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func InitialWSRoute(router fiber.Router, ws *Websocket.WSBookingHandler, supabaseClient *supabase.Client) {
	// For usecase with middleware
	router.Get("/room/:roomID", websocket.New(ws.GetBookingStatusByRoomID))
	router.Get("/status", websocket.New(middleware.WithWSAuth(supabaseClient, ws.GetBookingStatus)))
	router.Get("/:room", websocket.New(middleware.WithWSAuth(supabaseClient, ws.GetBooking)))
}