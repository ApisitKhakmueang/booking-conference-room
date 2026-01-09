import { useHandleAuth } from "@/hooks/auth/useHandleAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SignInGoogle from "./sign-in-google";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/button";

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSignIn, handleSignInWithGoogle } = useHandleAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className='absolute inset-0 flex justify-center w-full h-full text-lg'>
      <div className='flex flex-col items-center justify-center xl:w-5/9 lg:w-7/9 sm:w-5/7 w-full h-full'>
        <div className="p-10 rounded-xl w-full">
          <form 
            className='flex flex-col items-center w-full gap-5'
            onSubmit={handleSubmit}
            >
            <div className='flex flex-col justify-start w-full dark:text-main'>
              <h1 className='text-3xl font-semibold'>Welcome back !</h1>
              <h1 className="text-slate">Sign in to your account</h1>
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
                <p 
                  className='hover:cursor-pointer'
                  onClick={() => router.push('/auth/forgot-password')}>
                    Forgot password?
                </p>
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

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" variant="dark-purple" disabled={isLoading} className='p-3'>
                {isLoading ? "Signing in..." : "Sign in"}
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

          <SignInGoogle handleSignInWithGoogle={handleSignInWithGoogle}/>
        </div>
      </div>
    </div>
  )
}