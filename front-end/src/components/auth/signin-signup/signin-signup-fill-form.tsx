import { useState } from "react";
import { Input } from "@/components/ui/input";
import ShowPassword from "../../utils/show-password";
import { SignInProps } from "@/utils/interface/interface";
import { useRouter } from "next/navigation";
import DisplayStrongPassword from "./display-strong-password";
import useValidatePassword from "@/hooks/auth/useValidatePassword";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth";
import { checkStrongPassword } from "@/lib/validation";

export default function SignIn_SignUp_Fill_Form({ isSignIn }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  const { validation, handleValidation } = useValidatePassword()

  const submitSignIn = async (
    e: React.FormEvent,
    email: string,
    password: string
  ) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password)
      if (result?.error) {
        throw new Error(result.error); // ถ้ามี error จริงๆ ค่อย throw
      }
      router.replace('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const submitSignUp = async (
    e: React.FormEvent,
    email: string,
    password: string,
  ) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    if (!checkStrongPassword(password)) {
      setError("Password is not strong enough");
      setIsLoading(false);
      return
    }

    try {
      const result = await signUp(email, password)
      if (result?.error) {
        throw new Error(result.error); // ถ้ามี error จริงๆ ค่อย throw
      }
      router.replace(`/auth/sign-up-success`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

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

        <div className='flex justify-between items-baseline'>
          <label htmlFor="password">Password</label>
          {isSignIn && (
            <p 
              className='hover:cursor-pointer text-sm'
              onClick={() => router.push('/auth/forgot-password')}>
                Forgot password ?
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
              handleValidation(e.target.value)
            }}
          />

          <ShowPassword isShowPassword={isShowPassword} setIsShowPassword={setIsShowPassword} />
        </div>

        {!isSignIn && (
          <>
            <DisplayStrongPassword password={validation} />
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