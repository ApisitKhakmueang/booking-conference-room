package http

import (
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/fiber/v2"
)

type ConfigHandler struct {
	usecase domain.ConfigUsecase
}

func NewConfigHandler(usecase domain.ConfigUsecase) *ConfigHandler {
	return &ConfigHandler{usecase: usecase}
}

func (u *ConfigHandler) GetHoliday(c *fiber.Ctx) error {
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

func (u *ConfigHandler) GetConfig(c *fiber.Ctx) error {
	ctx := c.UserContext()
	response, err := u.usecase.GetConfig(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(response)
}

func (u *ConfigHandler) UpdateConfig(c *fiber.Ctx) error {
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