import { useRouter } from "next/navigation"

interface SignInGoogleProps {
  handleSignInWithGoogle: () => Promise<void>;
}

export default function SignInGoogle({ handleSignInWithGoogle }: SignInGoogleProps) {
  const router = useRouter();

  return (
    <div className='flex flex-col mt-5'>
      <button type='button' onClick={handleSignInWithGoogle} className='flex items-center justify-center gap-2 cursor-pointer bg-gray-300 hover:bg-white border border-gray-300 transition-duration-300 p-3 rounded-full'>
        <img src='/logo/google-logo.svg' alt="google-logo" className='w-5'/>
        Sign in with Google
      </button>

      <p className='flex gap-2 justify-center mt-4'>
        Don&apos;t have an account? 
        <span  
          className='cursor-pointer font-semibold'
          onClick={() => router.push('/auth/sign-up')}>
          Sign Up
        </span>
      </p>
    </div>
  )
}