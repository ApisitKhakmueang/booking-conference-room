import Button from "@/components/ui/button";
import { useRouter } from "next/navigation"

interface SignInGoogleProps {
  handleSignInWithGoogle: () => Promise<void>;
}

export default function SignInGoogle({ handleSignInWithGoogle }: SignInGoogleProps) {
  const router = useRouter();

  return (
    <div className='flex flex-col mt-5'>
      <Button type='button' variant="slate" onClick={handleSignInWithGoogle} className='flex items-center justify-center gap-2 p-3 border border-slate-300 hover:border-none'>
        <img src='/logo/google-logo.svg' alt="google-logo" className='w-5'/>
        Sign in with Google
      </Button>

      <p className='flex gap-2 justify-center mt-4 sm:text-base text-[15px]'>
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