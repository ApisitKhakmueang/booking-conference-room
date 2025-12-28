'use client'

import { useHandleAuth } from '@/src/hooks/auth/useHandleAuth'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleSignIn, handleSignUp, handleSignInWithGoogle } = useHandleAuth()

  return (
    <div>
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

      <hr />

      <button onClick={handleSignInWithGoogle}>
        Login with Google
      </button>
    </div>
  )
}
