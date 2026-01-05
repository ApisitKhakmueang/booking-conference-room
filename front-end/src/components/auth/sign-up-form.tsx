'use client'

import { useHandleAuth } from '@/hooks/auth/useHandleAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const { handleSignUp } = useHandleAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type='submit' disabled={isLoading}>
          {isLoading ? "Creating an account..." : "Sign up"}
        </button>
      </form>
    </>
  )
}