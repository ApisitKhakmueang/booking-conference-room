'use client'

import Image from 'next/image'
import SignIn_SignUp from './signin-signup'
import ThemeButton from '@/components/utils/theme-button'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignIn_SignupForm() {
  const pathname = usePathname()
  const isSignIn = pathname.includes('sign-in')
  
  const title = isSignIn ? 'Welcome back !' : 'Get started'
  const subTitle = isSignIn ? 'Sign in to your account' : 'Create your account'

  return (
    <main className={`flex min-h-screen bg-light-sidebar dark:bg-sidebar dark:text-secondary overflow-auto`}>
      <div className='relative flex flex-col xl:w-3/5 w-full h-screen'>
        <div className='flex justify-between items-center xs:p-5 p-3'>
          <Image 
            src='/logo/logoEE-color.png'
            alt='color logo'
            width={80}
            height={80}
            className="w-auto h-12 md:h-16 lg:h-20 object-contain" // ป้องกันโลโก้ยืดหดผิดสัดส่วน
            priority
          />

          <div className='relative z-10'>
            <ThemeButton className='p-0' />
          </div>
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <SignIn_SignUp 
            isSignIn={isSignIn} 
            title={title} 
            subTitle={subTitle} 
          />
        </div>
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