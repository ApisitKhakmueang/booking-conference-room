import { WelcombackProps } from "@/lib/interface/interface";

export default function Welcomeback({ isOpen, user }: WelcombackProps) {
  return (
    <div className={`flex flex-col font-semibold text-3xl ${isOpen ? "pl-5" : "pl-12"}`}>
      Welcome back, {user?.name}!
      <span className="font-normal text-base text-slate">This is conference room booking system</span>
    </div>
  )
}