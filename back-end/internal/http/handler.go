package http

import (
	// "log"
	"strconv"
	// "fmt"
	// "time"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	// "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/usecase"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type OrderHandler struct {
	usecase domain.OrderUsecase
}

func NewOrderHandler(usecase domain.OrderUsecase) *OrderHandler {
	return &OrderHandler{usecase: usecase}
}

// dataFetcher คือฟังก์ชันที่เราจะโยน "วิธีการดึงข้อมูล" เข้าไป (ยังไม่ดึงทันที)
// func (u *OrderHandler) ServeContentWithTimeETag(
// 	c *fiber.Ctx, 
// 	lastModified time.Time, 
// 	dataFetcher func() (interface{}, error)) error {
// 	// 1. สร้าง ETag จากเวลา (Unix Timestamp)
// 	etag := fmt.Sprintf(`"%d"`, lastModified.Unix())

// 	// 2. ตรวจสอบว่า Client มีของเดิมไหม (If-None-Match)
// 	if c.Get("If-None-Match") == etag {
// 		// ✅ HIT: มีของแล้ว ไม่ต้องทำอะไรเพิ่ม
// 		return c.SendStatus(fiber.StatusNotModified) // ส่ง 304 กลับทันที
// 	}

// 	// ❌ MISS: ของเก่า หรือ ไม่มีของ
	
// 	// 3. เตรียม Header ไว้ให้รอบหน้า
// 	c.Set("ETag", etag)
// 	c.Set("Cache-Control", "no-cache") // ให้ Client กลับมาเช็คทุกครั้ง

// 	// 4. 🔥 จุดสำคัญ: เพิ่งจะเริ่มดึงข้อมูลจริงตรงนี้ (Lazy Loading)
// 	data, err := dataFetcher()
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	// 5. ส่งข้อมูล JSON กลับไป
// 	return c.Status(fiber.StatusOK).JSON(data)
// }

// func (u *OrderHandler) GetCalendar(c *fiber.Ctx) error {
// 	// 1. รับค่า Year/Month จาก URL (เช่น /api/calendar?year=2024&month=12)
// 	q := domain.CalendarFilter{
// 		Year:  uint(time.Now().Year()),
// 		Month: uint(time.Now().Month()),
// 	}

// 	// 3. สั่ง Parser (มันจะทับค่า Default เฉพาะตัวที่ส่งมาถูกต้อง)
// 	// ถ้าส่ง ?year=-5 มันจะ Parse ไม่ผ่าน และใช้ค่า Default (หรือเป็น 0) ให้เอง
// 	if err := c.QueryParser(&q); err != nil {
// 			// กรณี Parse Error (ปกติ Fiber จะจัดการให้เงียบๆ)
// 	}
	
// 	// ถ้า User ส่ง ?year=-2025 -> ParseUint Error -> ค่าจะเป็น 0 หรือค่าเดิม
// 	// แต่เพื่อความชัวร์ ใส่ Logic กันเหนียวได้:
// 	if q.Year == 0 { q.Year = uint(time.Now().Year()) }
// 	if q.Month == 0 { q.Month = uint(time.Now().Month()) }

// 	if q.Month > 12 {
// 		return c.Status(fiber.StatusBadRequest).SendString("Can't send month more than 12")
// 	}

// 	checkTime, err := u.usecase.CheckTimeUpdated(q.Year, q.Month)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	return u.ServeContentWithTimeETag(c, *checkTime, 
// 		func() (interface{}, error) {
// 			response, err := u.usecase.GetCalendar(int(q.Year), int(q.Month))
// 			if err != nil {
// 				return nil, err
// 			}

// 			return response, nil
// 		},
// 	)
// }

func (u *OrderHandler) CreateBooking(c *fiber.Ctx) error {
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

	if err := u.usecase.CreateBooking(booking, uint(roomNumber)) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Create booking successfully !")
}

func (u *OrderHandler) UpdateBooking(c *fiber.Ctx) error {
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

	if err := u.usecase.UpdateBooking(booking, uint(roomNumber)); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	} 

	return c.Status(fiber.StatusOK).SendString("Update book successfully")
}

func (u *OrderHandler) DeleteBooking(c *fiber.Ctx) error {
	bookingID, err := uuid.Parse(c.Params("bookingID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if err := u.usecase.DeleteBooking(bookingID) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Delete booking successfully !")
}

// func (u *OrderHandler) GetUserBooking(c *fiber.Ctx) error {
// 	id, err := uuid.Parse(c.Params("id"))
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}

// 	bookings, err := u.usecase.GetUserBooking(id)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	return c.Status(fiber.StatusOK).JSON(bookings)
// }

// func (u *OrderHandler) GetBooking(c *fiber.Ctx) error {
// 	date := c.Params("date")

// 	filter := new(domain.GetBookingFilter)

// 	// ดึงจาก Query
// 	if err := c.QueryParser(filter); err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}

// 	log.Printf("duration: %s, room: %v", filter.Duration, filter.Room)
	
// 	if filter.Duration == "" || filter.Room == 0 {
// 		return c.Status(fiber.StatusBadRequest).SendString("Please send duration and room number")
// 	}

// 	response, err := u.usecase.GetBooking(date, filter)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}
// 	// log.Printf("res: %v", response)

// 	return c.Status(fiber.StatusOK).JSON(response)
// }