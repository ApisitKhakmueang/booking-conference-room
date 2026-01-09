'use client'

import Image from 'next/image'
import SignIn from './sign-in'

export default function SignInForm() {
  return (
    <main className='flex h-screen bg-light-purple'>
      <div className='flex flex-col lg:w-3/5 w-full h-full'>
        <div className='p-5'>
          <Image 
            src='/logo/logoEE-color.png'
            alt='color logo'
            width={80}
            height={80}
          />
        </div>

        <SignIn />
      </div>

      <div className='lg:flex hidden bg-red-500 h-full w-full'>
        test
      </div>
    </main>
  )
}