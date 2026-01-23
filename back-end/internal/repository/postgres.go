package repository

import (
	"errors"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type postgresOrderRepo struct {
	db *gorm.DB
}

func NewPostgresOrderRepo(db *gorm.DB) domain.OrderRepository {
	return &postgresOrderRepo{db: db}
}

func (p *postgresOrderRepo) Create(book *domain.Books) error {
	result := p.db.Create(&book)
	return result.Error
}

func (p *postgresOrderRepo) Get(id uuid.UUID) (*domain.Books, error) {
	book := new(domain.Books)
	result := p.db.First(book, id)
  if result.Error != nil {
		return nil, result.Error
	}

	return book, nil
}

func (p *postgresOrderRepo) Gets() ([]domain.Books, error) {
	var books []domain.Books
  result := p.db.Find(&books)
  if result.Error != nil {
    return nil, result.Error 
  }
  return books, nil
}

func (p *postgresOrderRepo) Update(book *domain.Books) error {
	result := p.db.Save(book)
  return result.Error
}

func (p *postgresOrderRepo) Delete(id uuid.UUID) error {
	var book domain.Books
  result := p.db.Delete(&book, id)
	if rowsAffected := result.RowsAffected; rowsAffected == 0 {
		return errors.New("This book not exist")
	}
  return nil
}

