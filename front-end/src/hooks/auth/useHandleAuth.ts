import { useRouter } from 'next/navigation'
import { useAuthActions } from '@/hooks/auth/useAuthAction'

export function useHandleAuth() {
  const router = useRouter()
  const { signUp, signIn, signInWithGoogle, forgotPassword } = useAuthActions()

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await signUp(email, password)
    if (error) {
      alert(error.message)
      return
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) {
      alert(error.message)
      return
    }
    router.push('/dashboard')
  }

  const handleSignInWithGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      alert(error.message)
    }
  }

  const handleForgotPassword = async (email: string) => {
    const { error } = await forgotPassword(email)
    if (error) {
      alert(error.message)
    }
  }

  return { handleSignUp, handleSignIn, handleSignInWithGoogle, handleForgotPassword }
}