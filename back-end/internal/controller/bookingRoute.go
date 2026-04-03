package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	"github.com/gofiber/fiber/v2"
)

func InitialBookingRoute(router fiber.Router, handler *http.BookingHandler) {
	router.Post("/", handler.CreateBooking)
	router.Put("/:bookingID", handler.UpdateBooking)
	router.Delete("/delete/:bookingID", handler.DeleteBooking)
	router.Delete("/checkout/:bookingID", handler.CheckoutBooking)
	router.Get("/user", handler.GetUserBooking)
	router.Get("/history", handler.GetUserHistory)
}

func InitialHelperRoute(router fiber.Router, handler *http.BookingHandler) {
	router.Get("/holiday", handler.GetHoliday)
	router.Get("/room/details", handler.GetRoomDetails)
}
