'use client'

import { useState } from "react"
import { Button } from "../ui/button";
import CardLayout from "../layout/card-layout";
import { Input } from "../ui/input";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    try {
      const result = await forgotPassword(email)
      if (result?.error) {
        throw new Error(result.error); // ถ้ามี error จริงๆ ค่อย throw
      }
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CardLayout>
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
    </CardLayout>
  )
}