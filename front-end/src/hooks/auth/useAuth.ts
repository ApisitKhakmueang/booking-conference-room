import { useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

export default function useAuth() {
  // 🌟 1. ใช้ useMemo เพื่อป้องกันไม่ให้สร้าง Client ใหม่ทุกครั้งที่ Component (NavigationLayout) re-render
  const supabase = useMemo(() => createClient(), []);
  
  const setUser = useAuthStore(((s) => s.setUser))
  const setSessionToken = useAuthStore((s) => s.setSessionToken)

  useEffect(() => {
    // ฟังก์ชันตัวช่วย: ดึงข้อมูลเบื้องต้นจาก Token ทันที
    const getFastUserData = (session: any) => {
      if (!session?.user) return null;
      const u = session.user;
      return {
        id: u.id,
        email: u.email!,
        name: u.user_metadata?.full_name, 
        avatar: u.user_metadata?.avatar_url,
        role: u.app_metadata?.role || u.user_metadata?.role, 
        isGoogleData: true, 
      };
    };

    // ฟังก์ชันตัวช่วย: ดึงข้อมูลจาก Database
    const updateLocalUserData = async (session: any) => {
      if (!session?.user) return;
      const u = session.user;

      // 🌟🌟🌟 2. คนเฝ้าประตู (THE GATEKEEPER) 🌟🌟🌟
      // ดึงข้อมูลผู้ใช้ปัจจุบันที่อยู่ใน Zustand Store ออกมาเช็ค
      const currentUser = useAuthStore.getState().user;
      
      // ถ้า: 1. มีข้อมูลใน Store แล้ว
      // และ: 2. เป็นผู้ใช้คนเดียวกัน (ID ตรงกัน)
      // และ: 3. ดึงข้อมูลจาก DB มาครบแล้ว (isGoogleData เป็น false)
      // 👉 ให้ "หยุด" การทำงานทันที (return) ไม่ต้องไปยิง Database ซ้ำ!
      if (currentUser && currentUser.id === u.id && currentUser.isGoogleData === false) {
        return; 
      }

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
          setUser({
            id: u.id,
            email: u.email!,
            name: profile.full_name || u.user_metadata?.full_name, 
            avatar: profile.avatar_url || u.user_metadata?.avatar_url,
            role: profile.role,
            isGoogleData: false, // บันทึกว่าดึงจาก DB แล้ว Gatekeeper จะได้บล็อกในรอบถัดไป
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

        setUser(getFastUserData(session));
        updateLocalUserData(session);

      } catch (err) {
        console.error('Unexpected error fetching session:', err);
      }
    }

    fetchInitialSession()
    
    // ฟัง event login / logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSessionToken(session?.access_token || null)

      const user = session?.user
      if (!user) {
        setUser(null)
        return
      }

      // 🌟 3. กรอง Event: ไม่จำเป็นต้องทำทุก Event
      // อัปเดตข้อมูลเฉพาะตอนล็อกอิน (SIGNED_IN) หรือเพิ่งโหลดหน้าจอใหม่ (INITIAL_SESSION)
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
         // ถ้า Gatekeeper ใน updateLocalUserData เห็นว่าข้อมูลครบแล้ว มันจะไม่ยอมให้ยิง API แน่นอน
         updateLocalUserData(session);
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSessionToken, supabase])
}