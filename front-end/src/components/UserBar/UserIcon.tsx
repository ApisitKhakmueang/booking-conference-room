import { useState } from "react";
import UserDetail from "./UserDetail";

type Props = {
  MOCK_USER: {
    name: string;
    avatarUrl: string;
    email: string;
  };
  isMobile?: boolean;
}

export default function UserIcon({ MOCK_USER, isMobile }: Props) {
  const [ isOpen, setIsOpen ] = useState(false)
  
  return (
    <>
      <div 
        className='border border-slate-400 hover:bg-slate-100 hover:-translate-y-1 transition-duration-300 rounded-full cursor-pointer p-1 select-none'
        onClick={() => setIsOpen(v => !v)}
        >
        <div className={`flex items-center gap-2 relative ${!isMobile ? 'pr-5' : 'p-1.5'}`}>
          <img src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} className="w-10 h-10 rounded-full object-cover" />

          <div className="lg:flex lg:flex-col lg:items-start hidden font-bold">
            {MOCK_USER.name}
            <span className="text-sm text-slate font-semibold">{MOCK_USER.email}</span>
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