package usercase

import (
	// "log"
	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

	// "github.com/google/uuid"
)

var roomCalendarID = []string{
	"1d126786ac639781b3265cefc212f26fa03d88fd770aaf77ce6131190618d323@group.calendar.google.com",
	"84aac15c69968c01979556cb2a69806ab8b0e1abd4850e3c3fce14ada426c1ed@group.calendar.google.com",
}

type orderUsecase struct {
	repo domain.BookingRepository // เรียกผ่าน Interface
	gateway domain.CalendarGateway
}

// NewOrderUsecase คือ Constructor
func NewOrderUsecase(repo domain.BookingRepository, gateway domain.CalendarGateway) domain.OrderUsecase {
	return &orderUsecase{
		repo: repo,
		gateway: gateway,
	}
}

// func (u *orderUsecase)	CreateBook(book *domain.Books) error {
// 	return u.repo.Create(book)
// }

// func (u *orderUsecase)	GetBook(id uuid.UUID) (*domain.Books, error) {
//   book, err := u.repo.Get(id)
// 	if err != nil {
// 		return nil, err
// 	}

//   return book, nil
// }

// func (u *orderUsecase)	GetBooks() ([]domain.Books, error) {
// 	books, err := u.repo.Gets()

// 	if err != nil {
// 		return nil, err
// 	}

//   return books, nil
// }

// func (u *orderUsecase)	UpdateBook(book *domain.Books) error {
// 	return u.repo.Update(book)
// }

// func (u *orderUsecase)	DeleteBook(id uuid.UUID) error {
// 	return u.repo.Delete(id)
// }

func (u *orderUsecase) CreateBooking(booking *domain.Booking, filter *domain.SearchFilter) error {
	googleCalendarID := roomCalendarID[filter.Room-1]
	calendarID, err := u.repo.GetCalendar(googleCalendarID)
	if err != nil {
		return err
	}

	booking.CalendarID = calendarID
	
	EventID, err := u.gateway.CreateEvent(booking, googleCalendarID, filter)
	if err != nil {
		return err
	}
	
	booking.GoogleEventID = EventID

	if err = u.repo.CreateBookingDB(booking); err != nil {
		return err
	}

	return nil
}