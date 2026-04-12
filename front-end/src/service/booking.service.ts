import api from '@/lib/axiosInstance';
import { BookingEventResponse, DashboardAnalyticsResponse, Holiday, RoomResp } from '@/utils/interface/response';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_HTTP;

export const bookingService = {
  // ดึงข้อมูลการจองตามวันที่
  fetchBookingUpNext: async (dateStr: string): Promise<BookingEventResponse> => {
    const response = await api.get(`${API_URL}/booking/up-next/${dateStr}`);
    return response.data;
  },

  fetchAnalyticBooking: async (startDate: string, endDate: string): Promise<DashboardAnalyticsResponse> => {
    const response = await api.get(`${API_URL}/booking/analytic?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  fetchAllBookingsByDate: async (dateStr: string): Promise<BookingEventResponse[]> => {
    // ระวัง: ตรงนี้ใช้ API_URL ตามที่คุณตั้งค่าไว้
    const response = await api.get(`${API_URL}/booking/date/${dateStr}`); 
    return response.data;
  },

  fetchRoomDetails: async ():Promise<RoomResp[]> => {
    const response = await api.get(`${API_URL}/rooms/details`);
    return response.data;
  },

  fetchRoomByID: async (roomID: string):Promise<RoomResp> => {
    const response = await api.get(`${API_URL}/room/${roomID}`);
    return response.data;
  },

  fetchUserBookings: async (date: string):Promise<BookingEventResponse[]> => {
    const response = await api.get(`${API_URL}/booking/me?date=${date}`);
    return response.data;
  },

  fetchUserHistory: async (date: string):Promise<BookingEventResponse[]> => {
    const response = await api.get(`${API_URL}/booking/me/history?date=${date}`);
    return response.data;
  },

  fetchHolidays: async (startYear:string, endYear: string):Promise<Holiday[]> => {
    const response = await api.get(`${API_URL}/holidays?startDate=${startYear}&endDate=${endYear}`)
    return response.data
  },

  // สร้างการจองใหม่
  createBooking: async (roomNumber: number | undefined, body: any) => {
    return await api.post(`${API_URL}/booking?room=${roomNumber}`, body);
  },

  updateBooking: async (bookingID: string | undefined, roomNumber: number | undefined, body: any) => {
    return await api.put(`${API_URL}/booking/${bookingID}?room=${roomNumber}`, body)
  },

  deleteBooking: async (bookingID: string | undefined) => {
    return await api.delete(`${API_URL}/booking/${bookingID}`)
  },

  checkoutBooking: async (bookingID: string | undefined) => {
    return await api.patch(`${API_URL}/booking/${bookingID}/checkout`)
  },

  checkinBooking: async (roomID: string, body: any) => {
    return await api.post(`${API_URL}/room/${roomID}/checkin`, body)
  }
  
  // เพิ่ม action อื่นๆ เช่น update, delete ได้ที่นี่
};