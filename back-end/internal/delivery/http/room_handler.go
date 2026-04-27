package http

import (
	"strings"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type RoomHandler struct {
	usecase domain.RoomUsecase
}

func NewRoomHandler(usecase domain.RoomUsecase) *RoomHandler {
	return &RoomHandler{usecase: usecase}
}

func (u *RoomHandler) CreateRoom(c *fiber.Ctx) error {
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

func (u *RoomHandler) UpdateRoom(c *fiber.Ctx) error {
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

func (u *RoomHandler) DeleteRoom(c *fiber.Ctx) error {
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

func (u *RoomHandler) GetRoom(c *fiber.Ctx) error {
	reponse, err := u.usecase.GetRoom(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(reponse)
}

func (u *RoomHandler) GetRoomByID(c *fiber.Ctx) error {
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