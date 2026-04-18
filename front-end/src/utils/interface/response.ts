export interface Holiday {
  id: string;              // int64 ใน Go มักจะใช้ number ใน TS
  updatedAt: string; // *time.Time เป็น pointer และเป็น format ISO string
  date: string;            // DateRes (gorm:"type:date") มักส่งมาเป็น "YYYY-MM-DD"
  name: string;
  isDayOff: boolean; // *bool ใน Go สามารถเป็น true, false หรือ null ได้
  source: string;
}

export interface RoomResponse {
  id: string
  name: string
  roomNumber: number
  location: string
  capacity: number
  status: string
}

export interface UserResponse {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role?: string
  status: string
}

export interface BookingEventResponse {
  id: string
  startTime: string
  endTime: string
  title: string
  passcode: string
  status: string
  User: UserResponse
  Room: RoomResponse
}

export interface AttendanceHealthResponse {
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
  canCelledRate: number
	noShowRate: number
}

export interface PopularRoomResponseonse {
  id: number;
  roomNumber: string;
  name: string;
  percentage: number;
}

export interface DashboardAnalyticsResponse {
  attendanceHealth: AttendanceHealthResponse;
  popularRooms: PopularRoomResponseonse[];
}

export interface ConfigResponse {
  startTime: string
  endTime: string
  maxAdvanceDays: number
  maxBookingMins: number
  noShowThresholdMins: number
}

export interface UserStatistics {
  upcoming: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface BookingHistoryItem {
  id: string;
  title: string;
  startTime: string; // Format ISO string
  endTime: string;   // Format ISO string
  status: string;    // "confirm" | "complete" | "cancelled" | "no_show"
  checkedInAt: string | null; // สามารถเป็น null ได้ถ้ายังไม่เช็คอิน
  Room: RoomResponse;    // ใช้ RoomResponse เดิมที่มีอยู่แล้วได้เลย
}

export interface UserHistoryResponse {
  user: UserResponse;        // ใช้ User เดิมที่มีอยู่แล้ว
  statistics: UserStatistics;
  bookingHistory: BookingHistoryItem[];
}