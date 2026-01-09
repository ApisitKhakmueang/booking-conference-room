'use client'

import { useHandleAuth } from "@/hooks/auth/useHandleAuth";
import { useState } from "react"
import Button from "../ui/button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { handleForgotPassword } = useHandleAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    try {
      const error = await handleForgotPassword(email)
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {success ? (
        <>
          <p>Check Your Email</p>
          <p>Password reset instructions sent</p>
          <p>If you registered using your email and password, you will receive a password reset email.</p>
        </>
      ) : (
        <>
          <p>Reset Your Password</p>
          <p>Type in your email and we&apos;ll send you a link to reset your password</p>

          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset email"}
            </Button>
          </form>
        </>
      )}
    </>
  )
}