
import SignIn_SignUp_Fill_Form from "./signin-signup-fill-form";
import Google from "./signin-signup-google";
import { SignIn_SignUpProps } from "@/lib/interface/interface";

export default function SignIn_SignUp({ isSignIn, title, subTitle } : SignIn_SignUpProps) {

  return (
    <div className='absolute inset-0 flex justify-center w-full h-full text-lg'>
      <div className='flex flex-col items-center justify-center xl:w-5/9 lg:w-7/9 sm:w-4/7 w-full h-full'>
        <div className="p-10 rounded-xl w-full">
          <div className='flex flex-col justify-start w-full dark:text-main md:mb-5 mb-3'>
            <h1 className='text-3xl font-semibold'>{title}</h1>
            <h1 className="text-slate">{subTitle}</h1>
          </div>

          <SignIn_SignUp_Fill_Form isSignIn={isSignIn} />

          <Google isSignIn={isSignIn}/>
        </div>
      </div>
    </div>
  )
}