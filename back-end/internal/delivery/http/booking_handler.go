package http

import (
	"strconv"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BookingHandlers struct {
	usecase domain.BookingUsecases
}

func NewBookingHandlers(usecase domain.BookingUsecases) *BookingHandlers {
	return &BookingHandlers{usecase: usecase}
}

func (u *BookingHandlers) CreateBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) UpdateBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) DeleteBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) CheckOutBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) CheckInBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) GetBookingByDay(c *fiber.Ctx) error {
	ctx := c.UserContext()
	date := c.Params("date")

	bookings, err := u.usecase.GetBookingByDay(ctx, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(bookings)
}

func (u *BookingHandlers) GetUpNextBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	date := c.Params("date")

	booking, err := u.usecase.GetUpNextBooking(ctx, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(booking)
}

func (u *BookingHandlers) GetAnalyticBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) GetUserBooking(c *fiber.Ctx) error {
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

func (u *BookingHandlers) GetUserHistory(c *fiber.Ctx) error {
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