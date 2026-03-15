import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"
import { SignInProps } from "@/utils/interface/interface";
import { useHandleAuth } from "@/hooks/auth/useHandleAuth";

export default function Google({ isSignIn }: SignInProps) {
  const { handleSignInWithGoogle } = useHandleAuth()
  const router = useRouter();

  return (
    <div className='flex flex-col mt-5'>
      <div className='relative md:mb-5 mb-3 dark:text-main'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-strong'></div>
        </div>

        <div className='relative flex justify-center'>
          <span className='bg-light-sidebar dark:bg-sidebar px-2'>or</span>
        </div>
      </div>

      <Button type='button' variant="slate" onClick={handleSignInWithGoogle} className='flex items-center justify-center gap-2 p-3 bg-light-google hover:bg-light-card text-white dark:bg-card dark:border-none dark:text-main dark:hover:bg-hover'>
        <img src='/logo/google-logo.svg' alt="google-logo" className='w-5 select-none'/>
        Sign in with Google
      </Button>

      {isSignIn && (
        <p className='flex gap-2 justify-center mt-4 sm:text-base text-[15px] dark:text-main select-none'>
          Don&apos;t have an account? 
          <span  
            className='cursor-pointer font-semibold'
            onClick={() => router.push('/auth/sign-up')}>
            Sign Up
          </span>
        </p>
      )}
    </div>
  )
}