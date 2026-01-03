'use client'

import { useResetPass } from "@/hooks/auth/useResetPass"
import { useState } from "react"


export default function ResetPasswordForm() {
  const [ password, setPassword ] = useState('')
  const resetPassword = useResetPass(password)

  return (
    <>
      <p>Password</p>
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => resetPassword}>reset password</button>
    </>
  )
}