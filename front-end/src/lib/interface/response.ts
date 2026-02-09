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
}

interface User {
  id: string
  email: string
  fullName: string
}

export interface BookingEvent {
  id: string
  updatedAt: string
  roomId: string
  userId: string
  startTime: string
  endTime: string
  title: string
  passcode: string
  status: string
  User: User
  Room: Room
}