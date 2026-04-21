import api from '@/lib/axiosInstance';
import { 
  BookingEventResponse, 
  ConfigResponse, 
  DashboardAnalyticsResponse, 
  Holiday, 
  RoomResponse, 
  PaginatedUserResponse,
  UserOverviewResponse,
  PaginatedBookingResponse
} from '@/utils/interface/response';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_HTTP;

export const bookingService = {
  // ดึงข้อมูลการจองตามวันที่

  fetchBookingUpNext: async (dateStr: string): Promise<BookingEventResponse> => {
    const response = await api.get(`${API_URL}/booking/up-next/${dateStr}`);
    return response.data;
  },

  fetchAnalyticBooking: async (startDate: string, endDate: string): Promise<DashboardAnalyticsResponse> => {
    const response = await api.get(`${API_URL}/booking/analytic/startDate/${startDate}/endDate/${endDate}`);
    return response.data;
  },

  fetchAllBookingsByDate: async (dateStr: string): Promise<BookingEventResponse[]> => {
    // ระวัง: ตรงนี้ใช้ API_URL ตามที่คุณตั้งค่าไว้
    const response = await api.get(`${API_URL}/booking/date/${dateStr}`); 
    return response.data;
  },

  fetchUserBookings: async (date: string):Promise<BookingEventResponse[]> => {
    const response = await api.get(`${API_URL}/booking/me/date/${date}`);
    return response.data;
  },

  fetchUserHistory: async (date: string):Promise<BookingEventResponse[]> => {
    const response = await api.get(`${API_URL}/booking/me/history/date/${date}`);
    return response.data;
  },

  // สร้างการจองใหม่
  createBooking: async (roomNumber: number | undefined, body: any) => {
    return await api.post(`${API_URL}/booking/room/${roomNumber}`, body);
  },

  updateBooking: async (bookingID: string | undefined, roomNumber: number | undefined, body: any) => {
    return await api.put(`${API_URL}/booking/${bookingID}/room/${roomNumber}`, body)
  },

  deleteBooking: async (bookingID: string | undefined) => {
    return await api.delete(`${API_URL}/booking/${bookingID}`)
  },

  checkoutBooking: async (bookingID: string | undefined) => {
    return await api.patch(`${API_URL}/booking/${bookingID}/checkout`)
  },
  
  // เพิ่ม action อื่นๆ เช่น update, delete ได้ที่นี่
};

export const roomService = {
  
  fetchRoomDetails: async ():Promise<RoomResponse[]> => {
    const response = await api.get(`${API_URL}/rooms/details`);
    return response.data;
  },

  fetchRoomByID: async (roomID: string):Promise<RoomResponse> => {
    const response = await api.get(`${API_URL}/room/${roomID}`);
    return response.data;
  },

  checkinBooking: async (roomID: string, body: any) => {
    return await api.post(`${API_URL}/room/${roomID}/checkin`, body)
  },

  createRoom: async (body: any) => {
    return await api.post(`${API_URL}/admin/room`, body);
  },

  updateRoom: async (roomID: string | undefined, body: any) => {
    return await api.put(`${API_URL}/admin/room/${roomID}`, body)
  },

  deleteRoom: async (roomID: string | undefined) => {
    return await api.delete(`${API_URL}/admin/room/${roomID}`)
  },
}

export const configService = {
  updateConfig: async (body:ConfigResponse) => {
    return await api.put(`${API_URL}/admin/config`, body)
  },

  fetchConfig: async (): Promise<ConfigResponse> => {
    const response = await api.get(`${API_URL}/config`)
    return response.data
  },
}

export const helperService = {
  fetchHolidays: async (startYear:string, endYear: string):Promise<Holiday[]> => {
    const response = await api.get(`${API_URL}/holidays/startDate/${startYear}/endDate/${endYear}`)
    return response.data
  },
}

export const adminService = {
  
  // GET /admin/users - ดึงรายชื่อผู้ใช้ทั้งหมดแบบแบ่งหน้า (Pagination)
  fetchPaginatedUsers: async (page: number, limit: number, search?: string): Promise<PaginatedUserResponse> => {
    // ส่ง page และ limit ผ่าน Query String
    const url = search ?
    `${API_URL}/admin/users?page=${page}&limit=${limit}&search=${search}`:
    `${API_URL}/admin/users?page=${page}&limit=${limit}`
    const response = await api.get(url);
    return response.data;
  },

  // GET /admin/users/:userID/overview - ดึงข้อมูลภาพรวมของผู้ใช้ (ข้อมูลส่วนตัว + สถิติ)
  fetchUserOverview: async (userID: string): Promise<UserOverviewResponse> => {
    const response = await api.get(`${API_URL}/admin/users/${userID}/overview`);
    return response.data;
  },

  // GET /admin/users/:userID/bookings - ดึงประวัติการจองของผู้ใช้แบบแบ่งหน้า (Pagination)
  fetchPaginatedUserBookings: async (userID: string, page: number, limit: number, status: string, year: number, month: number): Promise<PaginatedBookingResponse> => {
    // ใช้วิธีส่ง Query String เช่นเดียวกันกับการดึง User List
    const response = await api.get(`${API_URL}/admin/users/${userID}/bookings?page=${page}&limit=${limit}&status=${status}&year=${year}&month=${month}`);
    return response.data;
  },

  updateUserStatus: async (userID: string, status: 'active' | 'inactive'): Promise<string> => {
    const response = await api.put(`${API_URL}/admin/users/${userID}`, { 
      status: status 
    });
    return response.data;
  },
}