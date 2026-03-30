package http

import (
	// "log"
	// "fmt"
	"strconv"
	"time"
	// "time"

	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/delivery/websocket"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"

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
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	roomNumber, err := strconv.Atoi(c.Query("room", "0"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	
	booking := new(domain.Booking)
	if err := c.BodyParser(booking); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	booking.UserID = id

	if err := u.usecase.CreateBooking(ctx, booking, uint(roomNumber)) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Create booking successfully !")
}

func (u *BookingHandler) UpdateBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	bookingID, err := uuid.Parse(c.Params("bookingID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	// ดึงจาก Query
	roomNumber, err := strconv.Atoi(c.Query("room", "0"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	if roomNumber == 0 {
		return c.Status(fiber.StatusBadRequest).SendString("Please send room number")
	}

	booking := new(domain.Booking)
	if err := c.BodyParser(booking); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	booking.ID = bookingID

	if err := u.usecase.UpdateBooking(ctx, booking, uint(roomNumber)); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	} 

	return c.Status(fiber.StatusOK).SendString("Update book successfully")
}

func (u *BookingHandler) DeleteBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	bookingID, err := uuid.Parse(c.Params("bookingID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if err := u.usecase.DeleteBooking(ctx, bookingID) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Delete booking successfully !")
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

func (u *BookingHandler) GetUserBooking(c *fiber.Ctx) error {
	ctx := c.UserContext()
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	date := c.Query("date", time.Now().Format("2006-01"))
	// if err := c.Query("room", "0"); err != nil {
	// 	return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	// }

	bookings, err := u.usecase.GetUserBooking(ctx, userID, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(bookings)
}

func (u *BookingHandler) GetRoomDetails(c *fiber.Ctx) error {
	reponse, err := u.usecase.GetRoomDetails(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(reponse)
}

func (u *BookingHandler) GetHoliday(c *fiber.Ctx) error {
	ctx := c.UserContext()
	q := new(domain.Date)

	// 3. สั่ง Parser (มันจะทับค่า Default เฉพาะตัวที่ส่งมาถูกต้อง)
	// ถ้าส่ง ?year=-5 มันจะ Parse ไม่ผ่าน และใช้ค่า Default (หรือเป็น 0) ให้เอง
	if err := c.QueryParser(q); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	
	// ถ้า User ส่ง ?year=-2025 -> ParseUint Error -> ค่าจะเป็น 0 หรือค่าเดิม
	// แต่เพื่อความชัวร์ ใส่ Logic กันเหนียวได้:
	// if q.StartDate == "" { q.StartDate = fmt.Sprintf("%d-%d-%d", time.Now().Year(), time.Now().Month(), time.Now().Day()) }
	// if q.EndDate == "" { q.EndDate = fmt.Sprintf("%d-%d-%d", time.Now().Year(), time.Now().Month() + 1, time.Now().Day()) }
	response, err := u.usecase.GetHoliday(ctx, q)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(response)
}