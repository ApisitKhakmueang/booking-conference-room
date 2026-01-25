package repository

import (
	"errors"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type postgresBookingRepo struct {
	db *gorm.DB
}

func NewPostgresBookingRepo(db *gorm.DB) domain.BookingRepository {
	return &postgresBookingRepo{db: db}
}

func (p *postgresBookingRepo) Create(book *domain.Books) error {
	result := p.db.Create(&book)
	return result.Error
}

func (p *postgresBookingRepo) Get(id uuid.UUID) (*domain.Books, error) {
	book := new(domain.Books)
	result := p.db.First(book, id)
  if result.Error != nil {
		return nil, result.Error
	}

	return book, nil
}

func (p *postgresBookingRepo) Gets() ([]domain.Books, error) {
	var books []domain.Books
  result := p.db.Find(&books)
  if result.Error != nil {
    return nil, result.Error 
  }
  return books, nil
}

func (p *postgresBookingRepo) Update(book *domain.Books) error {
	result := p.db.Save(book)
  return result.Error
}

func (p *postgresBookingRepo) Delete(id uuid.UUID) error {
	var book domain.Books
  result := p.db.Delete(&book, id)
	if rowsAffected := result.RowsAffected; rowsAffected == 0 {
		return errors.New("This book not exist")
	}
  return nil
}

