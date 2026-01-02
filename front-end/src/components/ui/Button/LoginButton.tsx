// components/LoginButton.tsx
'use client'

import { supabase } from '@/lib/supabase/client'

export default function LoginButton() {
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/callback`,
      },
    })

    if (error) {
      console.error('Login error:', error.message)
    }
  }

  return (
    <button
      onClick={loginWithGoogle}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Login with Google
    </button>
  )
}
