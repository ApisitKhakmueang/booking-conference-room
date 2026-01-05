'use client'

import { useAuthActions } from "@/hooks/auth/useAuthAction"
import { useRouter } from "next/navigation";
import { useState } from "react"

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuthActions()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return
    }

    try {
      const { error } = await updatePassword(password)
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <p>Reset Your Password</p>
      <p>Please enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type='submit' disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </button>
      </form>
    </>
  )
}