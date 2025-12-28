import { useRouter } from 'next/navigation'
import { useAuthActions } from '@/src/hooks/auth/useAuthAction'

export function useHandleAuth() {
  const router = useRouter()
  const { signUp, signIn, signInWithGoogle } = useAuthActions()

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await signUp(email, password)
    if (error) {
      alert(error.message)
      return
    }
    router.push('/verify-email')
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

  return { handleSignUp, handleSignIn, handleSignInWithGoogle }
}