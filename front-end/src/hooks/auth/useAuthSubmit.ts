import { useState } from "react";
import { useHandleAuth } from "./useHandleAuth";
import { useRouter } from "next/navigation";
import useValidatePassword from "./useValidatePassword";

export default function useAuthSubmit() {
  const { handleSignIn, handleSignUp } = useHandleAuth()
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const { isStrongPassword, validatePassword } = useValidatePassword()

  const submitSignIn = async (
    e: React.FormEvent,
    email: string,
    password: string
  ) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    try {
      const error = await handleSignIn(email, password)
      if (error) throw error;
      router.replace('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const submitSignUp = async (
    e: React.FormEvent,
    email: string,
    password: string,
  ) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    if (!isStrongPassword(password)) {
      setError("Password is not strong enough");
      setIsLoading(false);
      return
    }

    try {
      const error = await handleSignUp(email, password)
      if (error) throw error
      router.replace(`/auth/sign-up-success`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return { submitSignIn, submitSignUp, validatePassword, isLoading, error };
}