import { useState } from "react";
import UserDetail from "./user-detail";
import { UserIconProps } from "@/lib/interface/interface";
import Image from "next/image";

export default function UserIcon({ isSmallDisplay, user }: UserIconProps) {
  const [ isOpen, setIsOpen ] = useState(false)
  
  return (
    <>
      <div 
        className={`border dark:border-none dark:bg-sidebar dark:hover:bg-hover border-slate-400 hover:bg-slate-100 hover:-translate-y-1 transition-transform duration-300 rounded-full cursor-pointer  select-none ${!isSmallDisplay ? 'p-1' : ''}`}
        onClick={() => setIsOpen(v => !v)}
        >
        <div className={`flex items-center gap-2 relative ${!isSmallDisplay ? 'pr-5' : 'p-[7px]'}`}>
          <div className="w-10 h-10 relative flex">
            <Image 
              src={user?.avatar || '/user/profile.jpg'}
              alt={'User avatar'}
              fill
              className="rounded-full object-cover" />
          </div>

          <div className="lg:flex lg:flex-col lg:items-start hidden font-bold dark:text-main text-black">
            {user?.name}
            <span className="text-sm text-slate font-semibold">{user?.email}</span>
          </div>

          {isOpen && (
            <div 
              className="absolute top-15 right-0">
              <UserDetail />
            </div>
          )}
        </div>
      </div>
    </>
  )
}