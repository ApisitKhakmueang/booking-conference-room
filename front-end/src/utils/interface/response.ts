export interface Holiday {
  id: string;              // int64 ใน Go มักจะใช้ number ใน TS
  updatedAt: string; // *time.Time เป็น pointer และเป็น format ISO string
  date: string;            // DateRes (gorm:"type:date") มักส่งมาเป็น "YYYY-MM-DD"
  name: string;
  isDayOff: boolean; // *bool ใน Go สามารถเป็น true, false หรือ null ได้
  source: string;
}

export interface RoomResp {
  id: string
  createdAt?: string
  updatedAt?: string
  name: string
  roomNumber: number
  location?: string
  capacity?: number
  isActive?: string
  status?: string
}

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role?: string
  createdAt?: string
}

export interface BookingEventResponse {
  id: string
  startTime: string
  endTime: string
  title: string
  passcode: string
  status: string
  User: User
  Room: RoomResp
}

export interface AttendanceHealthResponse {
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
  canCelledRate: number
	noShowRate: number
}

export interface PopularRoomResponse {
  id: number;
  roomNumber: string;
  name: string;
  percentage: number;
}

export interface DashboardAnalyticsResponse {
  attendanceHealth: AttendanceHealthResponse;
  popularRooms: PopularRoomResponse[];
}

export interface ConfigResponse {
  startTime: string
  endTime: string
  maxAdvanceDays: number
  maxBookingMins: number
  noShowThresholdMins: number
}