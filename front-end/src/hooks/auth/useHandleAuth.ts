import { useRouter } from 'next/navigation'
import { useAuthActions } from '@/hooks/auth/useAuthAction'

export function useHandleAuth() {
  const router = useRouter()
  const { signUp, signIn, signInWithGoogle, forgotPassword } = useAuthActions()

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await signUp(email, password)
    return error
  }

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    return error
  }

  const handleSignInWithGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      alert(error.message)
    }
  }

  const handleForgotPassword = async (email: string) => {
    const { error } = await forgotPassword(email)
    return error
  }

  return { handleSignUp, handleSignIn, handleSignInWithGoogle, handleForgotPassword }
}