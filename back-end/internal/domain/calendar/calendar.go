package calendarGateway

import "github.com/ApisitKhakmueang/BookingConferenceRoom/internal/domain"

// type RedisRepository interface {
// 	GetHolidayCache(start)
// }

type CalendarGateway interface {
	FetchHolidays(date *domain.Date) ([]domain.Holiday, error)
	// CreateEvent(booking *Booking, createEvent *CreateEvent) (string, error)
	// UpdateEventSameRoom(booking *Booking) error
	// CancelEvent(roomCalendarID string, eventID string) error

	// IsRoomAvailable(roomCalendarID string, Time *Date) error
	// IsRoomAvailableWithExclude(calendarID string, Time *Date, excludeEventID string) error
}