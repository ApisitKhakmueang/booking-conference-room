'use client'

import { useHandleAuth } from '@/hooks/auth/useHandleAuth'
import { useState } from 'react'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleSignIn, handleSignUp, handleSignInWithGoogle, handleForgotPassword } = useHandleAuth()


  return (
    <>
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

      <button onClick={() => handleSignIn(email, password)}>Login</button>
      <button onClick={() => handleSignUp(email, password)}>Sign up</button>
      <button onClick={() => handleForgotPassword(email)}>Forgot Password</button>

      <hr />

      <button onClick={handleSignInWithGoogle}>
        Login with Google
      </button>
    </>
  )
}