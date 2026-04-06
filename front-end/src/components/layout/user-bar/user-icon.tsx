import { useEffect, useRef, useState } from "react";
import UserDetail from "./user-detail";
import { UserProfile } from "@/utils/interface/interface";
import Image from "next/image";

export function UserIcon({ isHideNav, user }: { isHideNav: boolean; user: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div 
      className={`border dark:border-none dark:bg-sidebar dark:hover:bg-hover border-slate-400 hover:bg-slate-100 hover:-translate-y-1 transition-transform duration-300 rounded-full cursor-pointer  select-none ${!isHideNav ? 'p-1' : ''}`}
      onClick={() => setIsOpen(v => !v)}
      ref={profileRef}
      >
      <div className={`flex items-center gap-2 relative ${!isHideNav ? 'pr-5' : 'p-[7px]'}`}>
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
            className="absolute z-30 top-15 right-0">
            <UserDetail />
          </div>
        )}
      </div>
    </div>
  )
}

export function UserIconSkeleton({ isHideNav }: { isHideNav: boolean }) {
  return (
    <div className={`border dark:border-none dark:bg-sidebar border-slate-400 rounded-full select-none animate-pulse ${!isHideNav ? 'p-1' : ''}`}>
      <div className={`flex items-center gap-2 relative ${!isHideNav ? 'pr-5' : 'p-[7px]'}`}>
        
        {/* 🌟 Avatar Skeleton */}
        <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-white/10 shrink-0"></div>

        {/* 🌟 Text Skeleton 
            แก้ไข: เติม w-[160px] (หรือปรับตัวเลขเพิ่มลดได้) เพื่อกันกรอบให้กว้างเท่าๆ กับของจริง 
        */}
        <div className="lg:flex lg:flex-col lg:items-start hidden gap-1.5 pt-0.5 w-40">
          {/* ขีดจำลองบรรทัดชื่อ */}
          <div className="w-20 h-4 bg-slate-300 dark:bg-white/10 rounded-md"></div>
          {/* ขีดจำลองบรรทัดอีเมล (ให้ยาวเต็มกรอบ w-[160px] ที่เราจองไว้) */}
          <div className="w-full h-3 bg-slate-300 dark:bg-white/10 rounded-md"></div>
        </div>
        
      </div>
    </div>
  );
}