import { useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import ShowPassword from "../../utils/show-password";
import { SignInProps } from "@/utils/interface/interface";
import useAuthSubmit from "@/hooks/auth/useAuthSubmit";
import { useRouter } from "next/navigation";
import DisplayStrongPassword from "./display-strong-password";
import useValidatePassword from "@/hooks/auth/useValidatePassword";

export default function SignIn_SignUp_Fill_Form({ isSignIn }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const router = useRouter()
  const { validatePassword, passwordValidation } = useValidatePassword()
  const { submitSignIn, submitSignUp, isLoading, error } = useAuthSubmit()

  return (
    <form 
      className='flex flex-col items-center w-full'
      onSubmit={isSignIn ? (e) => submitSignIn(e, email, password) : (e) => submitSignUp(e, email, password)}
      >
      <div className='flex flex-col w-full md:gap-5 gap-3 dark:text-main'>
        <label htmlFor="email">Email</label>
        <Input
          id='email'
          type='email'
          placeholder="you@example.com"
          value={email}
          required
          className="border border-gray-300 rouded-lg p-2"
          onChange={e => setEmail(e.target.value)}
        />

        <div className='flex justify-between'>
          <label htmlFor="password">Password</label>
          {isSignIn && (
            <p 
              className='hover:cursor-pointer'
              onClick={() => router.push('/auth/forgot-password')}>
                Forgot password?
            </p>
          )}
        </div>

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

        {!isSignIn && (
          <>
            <DisplayStrongPassword password={passwordValidation} />
          </>
        )}

        <div className="flex flex-col gap-2">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="dark-purple" disabled={isLoading} className='p-3'>
            {isSignIn ? (isLoading ? "Signing in..." : "Sign in") : (isLoading ? "Creating account..." : "Create account")}
          </Button>
        </div>
      </div>
    </form>
  )
}