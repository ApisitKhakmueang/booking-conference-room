import { WelcombackProps } from "@/lib/interface/interface";

export default function Welcomeback({ isOpen, user }: WelcombackProps) {
  return (
    <div className={`flex flex-col dark:text-main text-black font-semibold text-3xl ${isOpen ? "pl-5" : "pl-12"}`}>
      Welcome back, {user?.name}!
      <span className="font-normal text-base dark:text-secondary text-slate">This is conference room booking system</span>
    </div>
  )
}