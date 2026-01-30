package usercase

import (
	"log"

	"github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"
	"github.com/google/uuid"
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
	calendar, err := u.repo.GetCalendar(filter.Room)
	if err != nil {
		return err
	}

	booking.CalendarID = calendar.ID
	
	eventID, err := u.gateway.CreateEvent(booking, calendar.GoogleCalendarID, filter)
	if err != nil {
		return err
	}
	
	booking.GoogleEventID = eventID

	if err = u.repo.CreateBookingDB(booking); err != nil {
		return err
	}

	return nil
}

func (u *orderUsecase) UpdateBooking(booking *domain.Booking, roomNumber uint) error {
	if err := u.repo.CheckSameRoom(booking, roomNumber); err != nil {
		// UpdateNewRoom
		cancelErr := u.gateway.CancelEvent(booking.Calendar.GoogleCalendarID, booking.GoogleEventID)
		if cancelErr != nil {
			return cancelErr
		}

		filter := domain.SearchFilter{
			Email: booking.User.Email,
			Room: roomNumber,
		}

		eventID, err := u.gateway.CreateEvent(booking, booking.Calendar.GoogleCalendarID, &filter)
		if err != nil {
			return err
		}

		calendar, err := u.repo.GetCalendar(roomNumber)
		if err != nil {
			return err
		}
		booking.CalendarID = calendar.ID
		booking.GoogleEventID = eventID
	} else {
		// UpdateSameRoom
		// log.Println("enter update same room")
		// log.Printf("booking: %v\n", booking)

		updateErr := u.gateway.UpdateEventSameRoom(booking)
		if updateErr != nil {
			return updateErr
		}
	}

	log.Println("enter before update in db")
	log.Printf("booking: %v\n", booking)
	if err := u.repo.UpdateBookingDB(booking); err != nil {
		return err
	}

	return nil
}

func (u *orderUsecase) DeleteBooking(bookingID uuid.UUID) error {
	booking, err := u.repo.GetEventID(bookingID)
	if err != nil {
		return err
	}

	// log.Printf("booking: %v", booking)
	// log.Printf("booking: %v", booking.GoogleEventID)
	if err = u.gateway.CancelEvent(booking.Calendar.GoogleCalendarID, booking.GoogleEventID); err != nil {
		return err
	}
	
	if err = u.repo.DeleteBookingDB(bookingID); err != nil {
		return err
	}

	return nil
}