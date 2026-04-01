import api from '@/lib/axiosInstance';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_HTTP;

export const bookingService = {
  // ดึงข้อมูลการจองตามวันที่
  fetchUserBookings: async (date: string) => {
    const response = await api.get(`${API_URL}/booking/user?date=${date}`);
    return response.data;
  },

  fetchUserHistory: async (date: string) => {
    const response = await api.get(`${API_URL}/booking/history?date=${date}`);
    return response.data;
  },

  fetchHolidays: async (startYear:string, endYear: string) => {
    const response = await api.get(`${API_URL}/holiday?startDate=${startYear}&endDate=${endYear}`)
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
  }
  
  // เพิ่ม action อื่นๆ เช่น update, delete ได้ที่นี่
};