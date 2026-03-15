'use client'

import Image from 'next/image'
import SignIn_SignUp from './signin-signup'
import ThemeButton from '@/components/utils/theme-button'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignIn_SignupForm() {
  const pathname = usePathname()
  const isSignIn = pathname.includes('sign-in')
  const [titleDetail, setTitleDetail] = useState({title: 'Welcome back !', subTitle: 'Sign in to your account'})

  useEffect(() => {
    setTitleDetail(isSignIn ? {title: 'Welcome back !', subTitle: 'Sign in to your account'} : {title: 'Get started', subTitle: 'Create your account'})
  }, [pathname])

  return (
    <main className={`flex min-h-screen bg-light-sidebar dark:bg-sidebar dark:text-secondary overflow-auto`}>
      <div className='relative flex flex-col xl:w-3/5 w-full h-screen'>
        <div className='flex justify-between items-center p-5'>
          <Image 
            src='/logo/logoEE-color.png'
            alt='color logo'
            width={80}
            height={80}
          />

          <div className='relative z-10'>
            <ThemeButton className='p-0' />
          </div>
        </div>

        <SignIn_SignUp isSignIn={isSignIn} title={titleDetail.title} subTitle={titleDetail.subTitle} />
      </div>

      <div className='lg:flex hidden w-full'>
        <img 
          className='object-cover flex flex-1'
          src="/background/background.gif" 
          alt="background" />
      </div>
    </main>
  )
}