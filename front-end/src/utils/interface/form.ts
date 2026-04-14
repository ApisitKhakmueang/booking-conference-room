export interface BodyBooking {
  title: string
  date: Date,
  startTime: string
  endTime: string
  duration: string
  room: RoomDisplay
}

interface RoomDisplay {
  id: string
  name: string
  roomNumber: number
}

export interface BookingValidationParams {
  startTime: string;
  endTime: string;
  duration: string;
  date: Date | string | null; 
}