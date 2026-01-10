import { useHandleAuth } from "@/hooks/auth/useHandleAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Google from "./signin-signup-google";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/button";
import { SignIn_SignUpProps } from "@/lib/interface/interface";

export default function SignIn_SignUp({ isSignIn, title, subTitle } : SignIn_SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSignIn, handleSignInWithGoogle, handleSignUp } = useHandleAuth()
  const router = useRouter()

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError(null);

    try {
      const error = await handleSignIn(email, password)
      if (error) throw error;
      router.replace('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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
      const error = await handleSignUp(email, password)
      if (error) throw error
      router.replace(`/auth/sign-up-success`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className='absolute inset-0 flex justify-center w-full h-full text-lg'>
      <div className='flex flex-col items-center justify-center xl:w-5/9 lg:w-7/9 sm:w-5/7 w-full h-full'>
        <div className="p-10 rounded-xl w-full">
          <form 
            className='flex flex-col items-center w-full gap-5'
            onSubmit={isSignIn ? handleSubmitSignIn : handleSubmit}
            >
            <div className='flex flex-col justify-start w-full dark:text-main'>
              <h1 className='text-3xl font-semibold'>{title}</h1>
              <h1 className="text-slate">{subTitle}</h1>
            </div>

            <div className='flex flex-col w-full gap-5 dark:text-main'>
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
                  onChange={e => setPassword(e.target.value)}
                />

                <div className="absolute flex items-center inset-y-0 right-3">
                  <button
                    className="cursor-pointer" 
                    type="button" 
                    onClick={() => setIsShowPassword(v => !v)}>
                    {isShowPassword ? (
                      <EyeOff />
                    ) : (
                      <Eye />
                    )}
                  </button>
                </div>
              </div>

              {!isSignIn && (
                <>
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

                    <div className="absolute flex items-center inset-y-0 right-3">
                      <button
                        className="cursor-pointer" 
                        type="button" 
                        onClick={() => setIsShowConfirmPassword(v => !v)}>
                        {isShowConfirmPassword ? (
                          <EyeOff />
                        ) : (
                          <Eye />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" variant="dark-purple" disabled={isLoading} className='p-3'>
                {isSignIn ? (isLoading ? "Signing in..." : "Sign in") : (isLoading ? "Creating account..." : "Create account")}
              </Button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-strong'></div>
                </div>

                <div className='relative flex justify-center'>
                  <span className='bg-light-sidebar dark:bg-sidebar px-2'>or</span>
                </div>
              </div>
            </div>
          </form>

          <Google 
            handleSignInWithGoogle={handleSignInWithGoogle}
            isSignIn={isSignIn}
            />
        </div>
      </div>
    </div>
  )
}