'use client'

import { supabase } from '@/src/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
    })
    alert('Check your email to verify your account')
  }

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

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

      <button onClick={signIn}>Login</button>
      <button onClick={signUp}>Sign up</button>

      <hr />

      <button onClick={signInWithGoogle}>
        Login with Google
      </button>
    </div>
  )
}
