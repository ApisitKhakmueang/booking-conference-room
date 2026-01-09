'use client'

import Image from 'next/image'
import SignIn from './sign-in'
import ThemeButton from '@/components/layout/sidebar/theme-button'
import { useThemeStore } from '@/stores/theme.store'

export default function SignInForm() {
  const { theme, toggle } = useThemeStore()

  return (
    <main className={`flex min-h-screen bg-light-sidebar dark:bg-sidebar dark:text-secondary ${theme}`}>
      <div className='relative flex flex-col xl:w-3/5 w-full h-screen'>
        <div className='flex justify-between items-center p-5'>
          <Image 
            src='/logo/logoEE-color.png'
            alt='color logo'
            width={80}
            height={80}
          />

          <div className='relative z-10'>
            <ThemeButton isOpen={true} theme={theme} toggle={toggle} className='p-0' />
          </div>
        </div>

        <SignIn />
      </div>

      <div className='lg:flex hidden w-full'>
        <img 
          className='object-cover'
          src="/background/background.gif" 
          alt="background" />
      </div>
    </main>
  )
}