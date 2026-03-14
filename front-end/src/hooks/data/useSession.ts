import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';

export default function useSession() {
  const supabase = createClient()
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // 1. ดึง Token มาเตรียมไว้ก่อนเชื่อมต่อ WS
  useEffect(() => {
    const fetchSession = async () => {
      // 🌟 1. ดักจับ Error และ Session โดยตรง
      const { data, error } = await supabase.auth.getSession();
      
      console.log("🕵️‍♂️ Supabase Raw Session:", data.session);
      if (error) console.error("🚨 Supabase Session Error:", error);

      setSessionToken(data.session?.access_token || null);
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // 🌟 2. ดูว่า Event ที่เกิดขึ้นคืออะไร (เช่น SIGNED_OUT หรือ INITIAL_SESSION)
        console.log('🔄 Supabase Auth Event:', event);
        console.log('🔄 Session State:', session ? 'Active' : 'Null');
        
        setSessionToken(session?.access_token || null);

        // 🌟 3. ถ้าระบบฟ้องว่า Logged Out เราควรเตะ User กลับไปหน้า Login
        if (event === 'SIGNED_OUT') {
           // แนะนำให้ใส่คำสั่งล้าง Zustand Store และ Redirect ไปหน้า Login ตรงนี้
           window.location.href = '/auth/sign-in'; 
        }
      }
    );

    // 🌟 3. คืนค่าฟังก์ชันสำหรับยกเลิกการดักฟัง (Cleanup) เพื่อไม่ให้เกิด Memory Leak
    return () => {
      subscription.unsubscribe();
    };
  }, []); // [] ไว้เหมือนเดิมได้เลย เพราะเราเซ็ต Listener ครั้งเดียว

  return sessionToken
}