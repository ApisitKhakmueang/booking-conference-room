package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	"github.com/gofiber/fiber/v2"
)

func InitialBookingRoute(router fiber.Router, handler *http.BookingHandler) {
	// CRUD พื้นฐาน
	router.Post("/room/:roomNumber", handler.CreateBooking)             // POST   /bookings/
	router.Put("/:bookingID/room/:roomNumber", handler.UpdateBooking)    // PUT    /bookings/:id
	router.Delete("/:bookingID", handler.DeleteBooking) // DELETE /bookings/:id (ลบคำว่า /delete ออก)
	
	// Action เฉพาะกิจ (อิงตาม ID)
	router.Patch("/:bookingID/checkout", handler.CheckOutBooking) // PATCH /bookings/:id/checkout (เปลี่ยนมาใช้ Patch/Post)
	
	// ข้อมูลส่วนตัวของคนที่ Login
	router.Get("/date/:date", handler.GetBookingByDay)
	router.Get("/up-next/:date", handler.GetUpNextBooking)
	router.Get("/analytic/startDate/:startDate/endDate/:endDate", handler.GetAnalyticBooking)
	router.Get("/me/date/:date", handler.GetUserBooking)           // GET /bookings/me
	router.Get("/me/history/date/:date", handler.GetUserHistory)   // GET /bookings/me/history
}

func InitialRoomRoute(router fiber.Router, handler *http.BookingHandler) {
	router.Post("/", handler.CreateRoom)
	router.Put("/:roomID", handler.UpdateRoom)
	router.Delete("/:roomID", handler.DeleteRoom)
}

func InitialHelperRoute(router fiber.Router, handler *http.BookingHandler) {
	// มาตรฐานมักจะใช้เป็นพหูพจน์ (Plural)
	router.Get("/config", handler.GetConfig)
	router.Post("/room/:roomID/checkin", handler.CheckInBooking)  // POST  /bookings/room/:id/checkin
	router.Get("/holidays/startDate/:startDate/endDate/:endDate", handler.GetHoliday) 
	router.Get("/rooms/details", handler.GetRoom) 
	router.Get("/room/:roomID", handler.GetRoomByID) // GET   /bookings/room/:id
}

func InitialAdminRoute(router fiber.Router, handler *http.BookingHandler) {
	router.Put("/config", handler.UpdateConfig)
}
