import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

export default function useAuth() {
  const supabase = createClient()
  const setUser = useAuthStore(((s) => s.setUser))
  const setSessionToken = useAuthStore((s) => s.setSessionToken)

  useEffect(() => {
    // 🌟 1. ฟังก์ชันตัวช่วย: ดึงข้อมูลเบื้องต้นจาก Token ทันที (เพื่อให้โหลดเร็ว)
    const getFastUserData = (session: any) => {
      if (!session?.user) return null;
      const u = session.user;
      return {
        id: u.id,
        email: u.email!,
        // ดึงจาก user_metadata ของ Google มาก่อน
        name: u.user_metadata?.full_name, 
        avatar: u.user_metadata?.avatar_url,
        // ดึง role จาก metadata (อาจอยู่ใน app_metadata หรือ user_metadata แล้วแต่คุณตั้งค่า)
        role: u.app_metadata?.role || u.user_metadata?.role, 
        // 🌟 เพิ่ม Flag เพื่อบอกว่าข้อมูลนี้เป็นข้อมูลจาก Google (เผื่อไว้เช็คสิทธิ์ในอนาคต)
        isGoogleData: true, 
      };
    };

    // 🌟 2. ฟังก์ชันตัวช่วย: แอบไปคิวรี Database เพื่อดูว่ามีชื่อ/รูปที่ผู้ใช้ตั้งเองในแอปไหม (ถ้ามีจะมาทับ Google)
    const updateLocalUserData = async (session: any) => {
      if (!session?.user) return;
      const u = session.user;

      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', u.id)
          .single();

        if (error) {
          console.error('Error fetching local profile:', error);
          return;
        }

        if (profile) {
          // 🌟 3. ปรับ Logic: "ข้อมูลในแอป (ตาราง users) ใหญ่ที่สุด"
          setUser({
            id: u.id,
            email: u.email!,
            // ถ้าในตาราง users มีชื่อ/รูป ให้ใช้ชื่อ/รูปที่ตั้งเองในแอป (Local Data)
            // ถ้าไม่มี (เป็นค่าว่าง) ให้ยึดจาก Google ต่อไป
            name: profile.full_name || u.user_metadata?.full_name, 
            avatar: profile.avatar_url || u.user_metadata?.avatar_url,
            role: profile.role,
            isGoogleData: false, // 🌟 ปรับ Flag เป็น false เพราะใช้ข้อมูลในแอปแล้ว
          });
        }
      } catch (err) {
        console.error('Unexpected error during local profile update:', err);
      }
    };

    const fetchInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        setSessionToken(session?.access_token || null)

        if (!session?.user) {
          setUser(null)
          return
        }

        // 🌟 Step 1: โหลดเร็ว! แสดงชื่อจาก Google ขึ้นมาก่อน
        setUser(getFastUserData(session));

        // 🌟 Step 2: แอบอัปเดต! ไปดึงข้อมูลในแอปมาทับ (ถ้ามี)
        updateLocalUserData(session);

      } catch (err) {
        console.error('Unexpected error fetching session:', err);
      }
    }

    fetchInitialSession()
    
    // ฟัง event login / logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSessionToken(session?.access_token || null)

      const user = session?.user
      if (!user) {
        setUser(null)
        return
      }

      // 🌟 Step 1: โหลดเร็ว! แสดงชื่อจาก Google ขึ้นมาก่อน (เช่น ตอนเพิ่งล็อกอินเสร็จ)
      setUser(getFastUserData(session));

      // 🌟 Step 2: แอบอัปเดต! ไปดึงข้อมูลในแอปมาทับ (ถ้ามี)
      updateLocalUserData(session);
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSessionToken, supabase])
}