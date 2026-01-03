import { useState } from "react";
import UserDetail from "./UserDetail";
import Image from "next/image";
import { UserIconProps } from "@/lib/interface/interface";

export default function UserIcon({ isMobile, user }: UserIconProps) {
  const [ isOpen, setIsOpen ] = useState(false)
  
  return (
    <>
      <div 
        className='border border-slate-400 hover:bg-slate-100 hover:-translate-y-1 transition-duration-300 rounded-full cursor-pointer p-1 select-none'
        onClick={() => setIsOpen(v => !v)}
        >
        <div className={`flex items-center gap-2 relative ${!isMobile ? 'pr-5' : 'p-1.5'}`}>
          <div className="w-10 h-10 relative flex">
            <Image 
              src={user?.avatar || '/userIcon/blank-profile.jpg'}
              alt={user?.email || 'User avatar'}
              fill
              className="rounded-full object-cover" />
          </div>

          <div className="lg:flex lg:flex-col lg:items-start hidden font-bold">
            {user?.name}
            <span className="text-sm text-slate font-semibold">{user?.email}</span>
          </div>

          {isOpen && (
            <div 
              className="absolute top-15">
              <UserDetail />
            </div>
          )}
        </div>
      </div>
    </>
  )
}