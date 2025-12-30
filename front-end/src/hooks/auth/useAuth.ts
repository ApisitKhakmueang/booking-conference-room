import { useEffect } from 'react'
import { supabase } from '@/src/lib/supabase/client'
import { useAuthStore } from '@/src/stores/auth.store'

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    // ดึง user ตอนโหลดครั้งแรก
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setUser(null)
        return
      }

      const u = data.user

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

    // ฟัง event login / logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
        // avatar: profile?.avatar_url,
        avatar: `${profile?.avatar_url}?v=${Date.now()}`,
        role: profile?.role,
      }

      setUser(userData)
    })

    return () => subscription.unsubscribe()
  }, [setUser, supabase])
}
