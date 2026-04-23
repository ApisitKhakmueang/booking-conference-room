'use client'

import { useState } from "react"
import { Button } from "../ui/button";
import CardLayout from "../layout/card-layout";
import { Input } from "../ui/input";
import ShowPassword from "../utils/show-password";
import useValidatePassword from "@/hooks/auth/useValidatePassword";
import DisplayStrongPassword from "./signin-signup/display-strong-password";
import { updatePassword } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validation, handleValidation } = useValidatePassword()
  const router = useRouter()

  const submitUpdate = async (
    e: React.FormEvent,
    password: string
  ) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    try {
      const result = await updatePassword(password)
      if (result?.error) {
        throw new Error(result.error); // ถ้ามี error จริงๆ ค่อย throw
      }
      router.replace('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CardLayout>
      <button 
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-light-secondary dark:text-secondary hover:text-light-main dark:hover:text-main transition-all duration-300 group cursor-pointer mb-6 w-fit"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Back</span>
      </button>

      <p className="text-3xl font-semibold">Reset Your Password</p>
      <p className="text-slate">Please enter your new password below.</p>

      <form onSubmit={e => submitUpdate(e, password)} className="flex flex-col gap-5">
        <label htmlFor="password">Password</label>
        <div className="relative">
          <Input
            id='password'
            type={isShowPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            className="w-full"
            required
            onChange={e => {
              setPassword(e.target.value)
              handleValidation(e.target.value)
            }}
          />

          <ShowPassword isShowPassword={isShowPassword} setIsShowPassword={setIsShowPassword} />
        </div>

        <DisplayStrongPassword password={validation}/>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button variant="dark-purple" type='submit' disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </form>
    </CardLayout>
  )
}