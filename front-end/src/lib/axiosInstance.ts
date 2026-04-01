import axios from 'axios';
import { createClient } from '../utils/supabase/client';

const supabase = createClient()

// สร้าง Axios Instance
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_HTTP}`, // ใส่ Base URL ของ Go Backend
});

// ใช้ Interceptor เพื่อดักจับ Request ก่อนส่งออกไป
api.interceptors.request.use(
  async (config) => {
    // ดึง session ทุกครั้งก่อนยิง API
    const { data: { session } } = await supabase.auth.getSession();
    
    // ถ้ามี session ให้แนบ Token เข้าไปใน Header
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;