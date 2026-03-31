import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_HTTP;
const USER_ID = "6d4ac759-dd57-4462-b980-4147b7d18cba"; // ในอนาคตควรดึงจาก Auth context

export const bookingService = {
  // ดึงข้อมูลการจองตามวันที่
  fetchUserBookings: async (date: string) => {
    const response = await axios.get(`${API_URL}/booking/user/${USER_ID}?date=${date}`);
    return response.data;
  },

  fetchUserHistory: async (date: string) => {
    const response = await axios.get(`${API_URL}/booking/history/${USER_ID}?date=${date}`);
    return response.data;
  },

  fetchHolidays: async (startYear:string, endYear: string) => {
    const response = await axios.get(`${API_URL}/holiday?startDate=${startYear}&endDate=${endYear}`)
    return response.data
  },

  // สร้างการจองใหม่
  createBooking: async (roomNumber: number | undefined, body: any) => {
    return await axios.post(`${API_URL}/booking/${USER_ID}?room=${roomNumber}`, body);
  },

  updateBooking: async (bookingID: string | undefined, roomNumber: number | undefined, body: any) => {
    return await axios.put(`${API_URL}/booking/${bookingID}?room=${roomNumber}`, body)
  },

  deleteBooking: async (bookingID: string | undefined) => {
    return await axios.delete(`${API_URL}/booking/${bookingID}`)
  }
  
  // เพิ่ม action อื่นๆ เช่น update, delete ได้ที่นี่
};