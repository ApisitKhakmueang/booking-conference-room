package http

import (
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

// func (u *OrderHandler)	CreateBook(c *fiber.Ctx) error {
// 	book := new(domain.Books)
// 	if err := c.BodyParser(book); err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	err := u.usecase.CreateBook(book)
	
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	return c.Status(fiber.StatusCreated).SendString("Book created successfully")
// }

// func (u *OrderHandler)	GetBook(c *fiber.Ctx) error {
// 	id, err := uuid.Parse(c.Params("id"))

// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

//   book, err := u.usecase.GetBook(id)
// 	if err != nil {
// 		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
// 			"message": "Book not found",
// 		})
// 	}

//   return c.Status(fiber.StatusOK).JSON(book)
// }

// func (u *OrderHandler)	GetBooks(c *fiber.Ctx) error {
// 	books, err := u.usecase.GetBooks()

// 	if err != nil {
// 		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
// 			"message": "Book not found",
// 		})
// 	}

//   return c.Status(fiber.StatusOK).JSON(books)
// }

// func (u *OrderHandler)	UpdateBook(c *fiber.Ctx) error {
// 	id, err := uuid.Parse(c.Params("id"))
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	book, err := u.usecase.GetBook(id)
// 	if err != nil {
// 		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
// 			"message": "Book not found",
// 		})
// 	}

// 	if err := c.BodyParser(book); err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	if err := u.usecase.UpdateBook(book); err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	return c.Status(fiber.StatusOK).SendString("Update book successfully")
// }

// func (u *OrderHandler)	DeleteBook(c *fiber.Ctx) error {
// 	id, err := uuid.Parse(c.Params("id"))
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
// 	}

// 	if err = u.usecase.DeleteBook(id); err != nil {
// 		return c.Status(fiber.StatusNotFound).SendString(err.Error())
// 	}

// 	return c.Status(fiber.StatusOK).SendString("Delete book successfully")
// }

func (u *OrderHandler) CreateBooking(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	filter := new(domain.SearchFilter)

	// ดึงจาก Query
	if err = c.QueryParser(filter); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	
	if filter.Email == "" || filter.Room == 0 {
		return c.Status(fiber.StatusBadRequest).SendString("Please send email and room number")
	}
	
	booking := new(domain.Booking)
	if err := c.BodyParser(booking); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	booking.UserID = id

	if err := u.usecase.CreateBooking(booking, filter) ; err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(booking)
}