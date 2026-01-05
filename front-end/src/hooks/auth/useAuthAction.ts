// hooks/auth/useAuthActions.ts
import { createClient } from '@/lib/supabase/client'

export function useAuthActions() {
  const supabase = createClient()

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/update-password`,
      }
    )

    return { error }
  }

  const updatePassword = async (newPassword: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  }

  return { signUp, signIn, signInWithGoogle, signOut, forgotPassword, updatePassword }
}