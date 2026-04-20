package http

import (
	"strconv"
	"strings"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BookingHandler struct {
	usecase domain.BookingUsecase
}

func NewBookingHandler(usecase domain.BookingUsecase) *BookingHandler {
	return &BookingHandler{ usecase: usecase }
}

func (u *BookingHandler) CreateBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	userID, err := uuid.Parse(c.Locals("user_id").(string))
	// userID, err := uuid.Parse(c.Params("userID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	roomNumber, err := strconv.Atoi(c.Params("roomNumber"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	
	booking := new(domain.Booking)
	if err := c.BodyParser(booking); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	booking.UserID = userID

	if err := u.usecase.CreateBooking(ctx, booking, uint(roomNumber)) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Create booking successfully !")
}

func (u *BookingHandler) UpdateBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	bookingID, err := uuid.Parse(c.Params("bookingID"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	// ดึงจาก Query
	roomNumber, err := strconv.Atoi(c.Params("roomNumber"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	userID, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if roomNumber == 0 {
		return c.Status(fiber.StatusBadRequest).SendString("Please send room number")
	}

	booking := new(domain.Booking)
	if err := c.BodyParser(booking); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	booking.ID = bookingID
	booking.UserID = userID

	if err := u.usecase.UpdateBooking(ctx, booking, uint(roomNumber)); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	} 

	return c.Status(fiber.StatusOK).SendString("Update book successfully")
}

func (u *BookingHandler) DeleteBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	booking := new(domain.Booking)
	bookingID, err := uuid.Parse(c.Params("bookingID"))
	userID, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	booking.ID = bookingID
	booking.UserID = userID

	if err := u.usecase.DeleteBooking(ctx, booking) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Delete booking successfully !")
}

func (u *BookingHandler) CheckOutBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	booking := new(domain.Booking)
	bookingID, err := uuid.Parse(c.Params("bookingID"))
	userID, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	booking.ID = bookingID
	booking.UserID = userID

	if err := u.usecase.CheckOutBooking(ctx, booking) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Checkout booking successfully !")
}

func (u *BookingHandler) CheckInBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	roomID, err := uuid.Parse(c.Params("roomID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	// ⭐️ สร้าง Struct เฉพาะกิจมารับ JSON แค่ฟิลด์เดียว
	var req struct {
		Passcode string `json:"passcode"`
	}
	
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if req.Passcode == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Passcode is required")
	}

	// ส่ง req.Passcode (ที่เป็น string ธรรมดา) ไปได้เลย ปลอดภัย 100%
	if err := u.usecase.CheckInBooking(ctx, roomID, req.Passcode); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Checkin booking successfully!")
}

func (u *BookingHandler) GetBookingByDay(c *fiber.Ctx) error {
	ctx := c.UserContext()
	date := c.Params("date")

	bookings, err := u.usecase.GetBookingByDay(ctx, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(bookings)
}

func (u *BookingHandler) GetUpNextBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	date := c.Params("date")

	booking, err := u.usecase.GetUpNextBooking(ctx, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(booking)
}

func (u *BookingHandler) GetBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	room, err := strconv.Atoi(c.Params("room"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	q := new(domain.Date)

	// 3. สั่ง Parser (มันจะทับค่า Default เฉพาะตัวที่ส่งมาถูกต้อง)
	// ถ้าส่ง ?year=-5 มันจะ Parse ไม่ผ่าน และใช้ค่า Default (หรือเป็น 0) ให้เอง
	if err := c.QueryParser(q); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	// log.Printf("duration: %s, room: %v", filter.Duration, filter.Room)
	
	if room == 0 {
		return c.Status(fiber.StatusBadRequest).SendString("Please send duration and room number")
	}

	response, err := u.usecase.GetBooking(ctx, q, uint(room))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	// log.Printf("res: %v", response)

	return c.Status(fiber.StatusOK).JSON(response)
}

func (u *BookingHandler) GetAnalyticBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()

	params := new(domain.Date)

	// 3. สั่ง Parser (มันจะทับค่า Default เฉพาะตัวที่ส่งมาถูกต้อง)
	// ถ้าส่ง ?year=-5 มันจะ Parse ไม่ผ่าน และใช้ค่า Default (หรือเป็น 0) ให้เอง
	if err := c.ParamsParser(params); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	response, err := u.usecase.GetAnalyticBooking(ctx, params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	// log.Printf("res: %v", response)

	return c.Status(fiber.StatusOK).JSON(response)
}

func (u *BookingHandler) GetUserBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	userID, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	date := c.Params("date")
	// if err := c.Query("room", "0"); err != nil {
	// 	return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	// }

	bookings, err := u.usecase.GetUserBooking(ctx, userID, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(bookings)
}

func (u *BookingHandler) GetUserHistory(c *fiber.Ctx) error {
	ctx := c.UserContext()
	userID, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	date := c.Params("date")
	// if err := c.Query("room", "0"); err != nil {
	// 	return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	// }

	bookings, err := u.usecase.GetUserHistory(ctx, userID, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(bookings)
}

func (u *BookingHandler) CreateRoom(c *fiber.Ctx) error {
	ctx := c.UserContext()
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	room := new(domain.Room)
	if err := c.BodyParser(room); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if err := u.usecase.CreateRoom(ctx, room) ; err != nil {
		if strings.Contains(err.Error(), "SQLSTATE 23505") || strings.Contains(err.Error(), "duplicate key") {
			return c.Status(fiber.StatusConflict).SendString("Unable to save: Room number already exists.")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Create room successfully !")
}

func (u *BookingHandler) UpdateRoom(c *fiber.Ctx) error {
	ctx := c.UserContext()
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	roomID, err := uuid.Parse(c.Params("roomID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}


	room := new(domain.Room)
	if err := c.BodyParser(room); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	room.ID = roomID

	if err := u.usecase.UpdateRoom(ctx, room); err != nil {
		if strings.Contains(err.Error(), "SQLSTATE 23505") || strings.Contains(err.Error(), "duplicate key") {
			return c.Status(fiber.StatusConflict).SendString("Unable to save: Room number already exists.")
		}
		
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	} 

	return c.Status(fiber.StatusOK).SendString("Update room successfully")
}

func (u *BookingHandler) DeleteRoom(c *fiber.Ctx) error {
	ctx := c.UserContext()
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	roomID, err := uuid.Parse(c.Params("roomID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if err := u.usecase.DeleteRoom(ctx, roomID) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Delete room successfully !")
}

func (u *BookingHandler) GetRoom(c *fiber.Ctx) error {
	reponse, err := u.usecase.GetRoom(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(reponse)
}

func (u *BookingHandler) GetRoomByID(c *fiber.Ctx) error {
	roomID, err := uuid.Parse(c.Params("roomID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	room, err := u.usecase.GetRoomByID(c.Context(), roomID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(room)
}

func (u *BookingHandler) GetHoliday(c *fiber.Ctx) error {
	ctx := c.UserContext()
	params := new(domain.Date)

	if err := c.ParamsParser(params); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	
	response, err := u.usecase.GetHoliday(ctx, params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(response)
}

func (u *BookingHandler) GetConfig(c *fiber.Ctx) error {
	ctx := c.UserContext()
	response, err := u.usecase.GetConfig(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(response)
}

func (u *BookingHandler) UpdateConfig(c *fiber.Ctx) error {
	ctx := c.UserContext()
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	config := new(domain.Config)
	if err := c.BodyParser(config); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	config.ID = 1 // สมมติมีแค่เรคอร์ดเดียวในตาราง Config
	if err := u.usecase.UpdateConfig(ctx, config); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Update config time successfully")
}

func (u *BookingHandler) GetPaginatedUsers(c *fiber.Ctx) error {
	ctx := c.UserContext()

	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}
	
	q := new(domain.UserPaginationQuery)
	// ดึงข้อมูลจาก ?page=1&limit=5&search=xxx มาใส่ใน q
	if err := c.QueryParser(q); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	response, err := u.usecase.GetPaginatedUsers(ctx, q)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (u *BookingHandler) GetUserOverview(c *fiber.Ctx) error {
	ctx := c.UserContext()

	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	// รับ userID จาก Params
	userID, err := uuid.Parse(c.Params("userID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid User ID")
	}

	// เรียก Usecase -> Repository
	response, err := u.usecase.GetUserOverview(ctx, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	// ส่งกลับเป็น JSON ก้อนเดียวที่มีทั้ง User และ Statistics
	return c.Status(fiber.StatusOK).JSON(response)
}

func (u *BookingHandler) GetPaginatedUserBookings(c *fiber.Ctx) error {
	ctx := c.UserContext()

	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	// 1. ดึง User ID จาก URL Params
	userID, err := uuid.Parse(c.Params("userID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid User ID")
	}

	// 2. รับค่า Query Params (Pagination & Filters)
	q := new(domain.BookingPaginationQuery)
	if err := c.QueryParser(q); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	// 3. เรียก Usecase (ซึ่งข้างในจะจัดการค่า Default Page/Limit เหมือนในหน้า User ปกติ)
	response, err := u.usecase.GetPaginatedUserBookings(ctx, userID, q)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(response)
}