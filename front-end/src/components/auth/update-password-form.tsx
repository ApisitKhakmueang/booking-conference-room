'use client'

import { useAuthActions } from "@/hooks/auth/useAuthAction"
import { useRouter } from "next/navigation";
import { useState } from "react"
import Button from "../ui/button";
import CardLayout from "../layout/card-layout";
import { Input } from "../ui/input";
import ShowPassword from "../utils/show-password";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)
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
      router.replace('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CardLayout>
      <p className="text-3xl font-semibold">Reset Your Password</p>
      <p className="text-slate">Please enter your new password below.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label htmlFor="password">Password</label>
        <div className="relative">
          <Input
            id='password'
            type={isShowPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            className="w-full"
            required
            onChange={e => setPassword(e.target.value)}
          />

          <ShowPassword isShowPassword={isShowPassword} setIsShowPassword={setIsShowPassword} />
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="relative">
          <Input
            id='confirmPassword'
            type={isShowConfirmPassword ? 'text' : 'password'}
            placeholder="********"
            value={confirmPassword}
            className="w-full"
            required
            onChange={e => setConfirmPassword(e.target.value)}
          />

          <ShowPassword isShowPassword={isShowConfirmPassword} setIsShowPassword={setIsShowConfirmPassword} />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button variant="dark-purple" type='submit' disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </form>
    </CardLayout>
  )
}