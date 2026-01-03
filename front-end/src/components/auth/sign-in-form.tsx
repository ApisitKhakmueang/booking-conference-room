'use client'

import { useHandleAuth } from '@/hooks/auth/useHandleAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleSignIn, handleSignUp, handleSignInWithGoogle } = useHandleAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSignIn(email, password)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

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

        <button type='submit'>Login</button>
      </form>
      
      <button onClick={() => handleSignUp(email, password)}>Sign up</button>
      <button onClick={() => router.push('/auth/forgot-password')}>Forgot Password</button>

      <hr />

      <button onClick={handleSignInWithGoogle}>
        Login with Google
      </button>
    </>
  )
}