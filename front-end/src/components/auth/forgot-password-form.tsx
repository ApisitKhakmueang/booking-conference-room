'use client'

import { useHandleAuth } from "@/hooks/auth/useHandleAuth";
import { useState } from "react"
import Button from "../ui/button";
import AuthLayout from "./auth-layout";
import { Input } from "../ui/input";

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
    <AuthLayout>
      {success ? (
        <>
          <p className="text-3xl font-semibold">Check your email</p>
          <p className="text-slate">Password reset instructions sent</p>
          <p>If you registered using your email and password, <br />
            you will receive a password reset email.</p>
        </>
      ) : (
        <div className="flex flex-col gap-10">
          <div>
            <p className="text-3xl font-semibold">Reset your password</p>
            <p className="text-slate">Enter your email and we&apos;ll send you a link to reset your password</p>
          </div>

          <form 
            className="flex flex-col justify-between gap-10"
            onSubmit={handleSubmit}>
            <Input 
              className="w-full"
              type="email" 
              placeholder="you@example.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} />

            <div className="flex flex-col gap-3">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button variant="dark-purple" type="submit" disabled={isLoading} className="whitespace-nowrap">
                {isLoading ? "Sending..." : "Send reset email"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AuthLayout>
  )
}