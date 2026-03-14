import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

export default function useAuth() {
  const supabase = createClient()
  const setUser = useAuthStore(((s) => s.setUser))
  const setSessionToken = useAuthStore((s) => s.setSessionToken)

  useEffect(() => {
    // 🌟 2. เปลี่ยนมาใช้ getSession() แทน getUser() เพื่อให้ได้ทั้งข้อมูล User และ access_token พร้อมกัน
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // เซ็ต Token ทันที
      setSessionToken(session?.access_token || null)

      if (!session?.user) {
        setUser(null)
        return
      }

      const u = session.user

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', u.id)
        .single()

      if (error) {
        console.log('error:', error)
        return
      }

      const userData = {
        id: u.id,
        email: u.email!,
        name: profile?.full_name,
        avatar: profile?.avatar_url,
        role: profile?.role,
      }

      setUser(userData)
    })

    // ฟัง event login / logout / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // 🌟 3. อัปเดต Token ใหม่ทุกครั้งที่มีการเปลี่ยนแปลง
      setSessionToken(session?.access_token || null)

      const user = session?.user
      if (!user) {
        setUser(null)
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('error:', error)
        return
      }

      const userData = {
        id: user.id,
        email: user.email!,
        name: profile?.full_name,
        avatar: `${profile?.avatar_url}?v=${Date.now()}`,
        role: profile?.role,
      }

      setUser(userData)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSessionToken, supabase])
}
