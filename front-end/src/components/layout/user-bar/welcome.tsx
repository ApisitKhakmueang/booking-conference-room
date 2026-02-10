import { UserProfile } from "@/lib/interface/interface";

export default function Welcomeback({ isOpenNav, user }: { isOpenNav: boolean; user: UserProfile | null }) {
  return (
    <div className={`flex flex-col dark:text-main text-black font-semibold text-3xl ${isOpenNav ? "pl-5" : "pl-12"}`}>
      Welcome back, {user?.name || 'Username'}!
      <span className="font-normal text-base dark:text-secondary text-slate">This is conference room booking system</span>
    </div>
  )
}