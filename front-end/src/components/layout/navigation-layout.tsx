"use client";

// Library
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

// Hook
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import useAuth from "@/hooks/auth/useAuth";

// Component
import UserBar from "./user-bar";
import Sidebar from "./sidebar";

// Context
import { useControlLayoutStore } from "@/stores/control-layout.store";

export default function NavigationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isOpenNav, isHideNav, setIsHideNav } = useControlLayoutStore(
    useShallow(((state) => ({
      isOpenNav: state.isOpenNav,
      isHideNav: state.isHideNav,
      setIsHideNav: state.setIsHideNav
    })))
  )

  // 2. ดึงค่า Media Query มาเก็บใส่ตัวแปร
  const isLargeScreen = useMediaQuery("(max-width: 1024px)")

  // 3. ✅ ใช้ useEffect เพื่อ Sync ค่า (Side Effect)
  useEffect(() => {
    // สั่ง update store เมื่อ isLargeScreen เปลี่ยนแปลงเท่านั้น
    setIsHideNav(isLargeScreen)
  }, [isLargeScreen, setIsHideNav])

  useAuth()
  
  return (
    <div>
      <div className="flex flex-col dark:bg-main-background bg-light-main-background dark:dark:text-stone-400 text-black min-h-screen">
        <Sidebar />

        <UserBar />

        <main
          className={`flex-1 transition-[margin,padding] duration-300 mt-25 ${!isHideNav && (isOpenNav ? "ml-70" : "ml-23")}
        `}>
          {children}
        </main>
      </div>
    </div>
  )
}