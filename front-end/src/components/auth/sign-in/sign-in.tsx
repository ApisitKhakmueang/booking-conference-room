import { useHandleAuth } from "@/hooks/auth/useHandleAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SignInGoogle from "./sign-in-google";

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className='flex justify-center w-full h-full inset-0 -mt-40'>
      <div className='flex flex-col items-center justify-center'>
        <form 
          className='flex flex-col items-center w-full gap-5'
          onSubmit={handleSubmit}
          >
          <div className='flex flex-col justify-start w-full'>
            <h1 className='text-3xl font-semibold'>Welcome back !</h1>
            <h1>Sign in to your account</h1>
          </div>

          <div className='flex flex-col w-full gap-2'>
            <label htmlFor="email">Email</label>
            <input
              id='email'
              type='email'
              placeholder="you@example.com"
              value={email}
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
            <input
              id='password'
              type="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={isLoading} className='cursor-pointer'>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-strong'></div>
              </div>

              <div className='relative flex justify-center'>
                <span className='bg-white px-2'>or</span>
              </div>
            </div>
          </div>
        </form>

        <SignInGoogle handleSignInWithGoogle={handleSignInWithGoogle}/>
      </div>
    </div>
  )
}