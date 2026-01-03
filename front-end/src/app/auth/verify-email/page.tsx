'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function VerifyEmailPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')

  const resend = async () => {
    await supabase.auth.resend({
      type: 'signup',
      email,
    })
    alert('Verification email sent')
  }

  return (
    <div>
      <h1>Verify your email</h1>
      <p>Please check your inbox</p>

      <input
        placeholder="your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button onClick={resend}>
        Resend email
      </button>
    </div>
  )
}
