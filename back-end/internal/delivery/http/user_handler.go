package http

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserHandler struct {
	usecase domain.UserUsecase
}

func NewUserHandler(usecase domain.UserUsecase) *UserHandler {
	return &UserHandler{usecase: usecase}
}

func (u *UserHandler) UpdateUserStatus(c *fiber.Ctx) error {
	ctx := c.UserContext()
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).SendString("Access denied")
	}

	userID, err := uuid.Parse(c.Params("userID"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid User ID")
	}

	// ⭐️ สร้าง Struct เฉพาะกิจมารับ JSON Body
	var req struct {
		Status string `json:"status"`
	}
	
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
	}

	if err := u.usecase.UpdateUserStatus(ctx, userID, req.Status); err != nil {
		// ดักจับ Error แจ้งว่าหา User ไม่เจอ (ต่อเนื่องจาก Repository ที่เราทำไว้)
		if err.Error() == "user not found" {
			return c.Status(fiber.StatusNotFound).SendString("User not found")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).SendString("Update user status successfully")
}

func (u *UserHandler) GetPaginatedUsers(c *fiber.Ctx) error {
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

func (u *UserHandler) GetUserOverview(c *fiber.Ctx) error {
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

func (u *UserHandler) GetPaginatedUserBookings(c *fiber.Ctx) error {
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