package controller

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/http"
	"github.com/gofiber/fiber/v2"
)

func InitialBookingRoute(router fiber.Router, handler *http.BookingHandler) {
	// CRUD พื้นฐาน
	router.Post("/", handler.CreateBooking)             // POST   /bookings/
	router.Put("/:bookingID", handler.UpdateBooking)    // PUT    /bookings/:id
	router.Delete("/:bookingID", handler.DeleteBooking) // DELETE /bookings/:id (ลบคำว่า /delete ออก)
	
	// Action เฉพาะกิจ (อิงตาม ID)
	router.Patch("/:bookingID/checkout", handler.CheckOutBooking) // PATCH /bookings/:id/checkout (เปลี่ยนมาใช้ Patch/Post)
	
	// ข้อมูลส่วนตัวของคนที่ Login
	router.Get("/date/:date", handler.GetBookingByDay)
	router.Get("/up-next/:date", handler.GetUpNextBooking)
	router.Get("/analytic", handler.GetAnalyticBooking)
	router.Get("/me", handler.GetUserBooking)           // GET /bookings/me
	router.Get("/me/history", handler.GetUserHistory)   // GET /bookings/me/history
}

func InitialHelperRoute(router fiber.Router, handler *http.BookingHandler) {
	// มาตรฐานมักจะใช้เป็นพหูพจน์ (Plural)
	router.Post("/room/:roomID/checkin", handler.CheckInBooking)  // POST  /bookings/room/:id/checkin
	router.Get("/holidays", handler.GetHoliday) 
	router.Get("/rooms/details", handler.GetRoom) 
	router.Get("/room/:room", handler.GetRoomByRoomNumber) // GET   /bookings/room/:id
}
