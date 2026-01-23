package usercase

import (
	"guyae/internal/domain"

	"github.com/google/uuid"
)

type orderUsecase struct {
	repo domain.OrderRepository // เรียกผ่าน Interface
}

// NewOrderUsecase คือ Constructor
func NewOrderUsecase(repo domain.OrderRepository) domain.OrderUsecase {
	return &orderUsecase{repo: repo}
}

func (u *orderUsecase)	CreateBook(book *domain.Books) error {
	return u.repo.Create(book)
}

func (u *orderUsecase)	GetBook(id uuid.UUID) (*domain.Books, error) {
  book, err := u.repo.Get(id)
	if err != nil {
		return nil, err
	}

  return book, nil
}

func (u *orderUsecase)	GetBooks() ([]domain.Books, error) {
	books, err := u.repo.Gets()

	if err != nil {
		return nil, err
	}

  return books, nil
}

func (u *orderUsecase)	UpdateBook(book *domain.Books) error {
	return u.repo.Update(book)
}

func (u *orderUsecase)	DeleteBook(id uuid.UUID) error {
	return u.repo.Delete(id)
}