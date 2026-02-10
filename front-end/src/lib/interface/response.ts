export interface Holiday {
  id: string;              // int64 ใน Go มักจะใช้ number ใน TS
  updatedAt: string; // *time.Time เป็น pointer และเป็น format ISO string
  date: string;            // DateRes (gorm:"type:date") มักส่งมาเป็น "YYYY-MM-DD"
  name: string;
  isDayOff: boolean; // *bool ใน Go สามารถเป็น true, false หรือ null ได้
  source: string;
}

interface Room {
  id: string
  name: string
  roomNumber: number
}

interface User {
  id: string
  email: string
  fullName: string
}

export interface BookingEvent {
  id: string
  startTime: string
  endTime: string
  title: string
  passcode: string
  status: string
  User: User
  Room: Room
}