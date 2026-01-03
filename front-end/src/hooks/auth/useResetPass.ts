import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export async function useResetPass(newPassword: string) {
  const router = useRouter()
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error

  router.push('/auth/sign-in')
}