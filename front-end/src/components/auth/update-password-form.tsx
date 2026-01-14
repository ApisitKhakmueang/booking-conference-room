'use client'

import { useState } from "react"
import Button from "../ui/button";
import CardLayout from "../layout/card-layout";
import { Input } from "../ui/input";
import ShowPassword from "../utils/show-password";
import useValidatePassword from "@/hooks/auth/useValidatePassword";
import useAuthSubmit from "@/hooks/auth/useAuthSubmit";
import DisplayStrongPassword from "./signin-signup/display-strong-password";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false)
  const { validatePassword, passwordValidation } = useValidatePassword()
  const { submitUpdate, isLoading, error } = useAuthSubmit()

  return (
    <CardLayout>
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
              validatePassword(e.target.value)
            }}
          />

          <ShowPassword isShowPassword={isShowPassword} setIsShowPassword={setIsShowPassword} />
        </div>

        <DisplayStrongPassword password={passwordValidation}/>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button variant="dark-purple" type='submit' disabled={isLoading}>
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </form>
    </CardLayout>
  )
}