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
  earlyCheckInMinutes: number
}

export interface PaginationMeta {
  totalItems: number;       // int64 ใน Go แปลงเป็น number
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  indexOfFirstItem: number; // ⭐️ ดึงมาจาก Struct ใหม่
  indexOfLastItem: number;  // ⭐️ ดึงมาจาก Struct ใหม่
}

// ==========================================
// 3. User & Statistics (ข้อมูลผู้ใช้และสถิติ)
// ==========================================

export interface UserStatsRes {
  upcoming: number;  // int64 แปลงเป็น number
  completed: number; 
  cancelled: number; 
  noShow: number;    
}

export interface UserOverviewResponse {
  user: UserResponse;
  statistics: UserStatsRes;
}

export interface PaginatedUserResponse {
  data: UserResponse[]; // สันนิษฐานว่าใช้โครงสร้างเดียวกับ UserInfoRes
  meta: PaginationMeta;
}

// ==========================================
// 4. Booking History & Rooms (ประวัติการจองและห้อง)
// ==========================================
export interface UserRoomRes {
  id: string;        // uuid.UUID แปลงเป็น string
  name: string;
  roomNumber: number; // uint แปลงเป็น number
  location: string;
}

export interface UserBookingHistoryRes {
  id: string;                 // uuid.UUID แปลงเป็น string
  title: string;
  startTime: string;   // *time.Time เป็น pointer เผื่อค่า null
  endTime: string;     // *time.Time เป็น pointer เผื่อค่า null
  status: string;      // *string เป็น pointer เผื่อค่า null
  checkedInAt: string; // *time.Time เป็น pointer เผื่อค่า null
  Room: UserRoomRes;          // ตัวพิมพ์ใหญ่ตาม json:"Room"
}

export interface PaginatedBookingResponse {
  data: UserBookingHistoryRes[];
  meta: PaginationMeta;
}