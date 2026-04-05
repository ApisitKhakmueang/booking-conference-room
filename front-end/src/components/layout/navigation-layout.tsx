"use client";

// Library
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/shallow";

// Hook
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import useAuth from "@/hooks/auth/useAuth";

// Component
import UserBar from "./user-bar";
import Sidebar from "./sidebar";

// Context
import { useControlLayoutStore } from "@/stores/control-layout.store";
import axios from "axios";
import { useRoomStore } from "@/stores/room.store";
import { bookingService } from "@/service/booking.service";
import Swal from "sweetalert2";

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

  const { setRoom } = useRoomStore(
    useShallow(((state) => ({
      setRoom: state.setRooms
    })))
  )
  // 2. ดึงค่า Media Query มาเก็บใส่ตัวแปร
  const isLargeScreen = useMediaQuery("(max-width: 1024px)")

  const fetchRoom = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_BACKEND_HTTP;
    try {
      const response = await bookingService.fetchRoomDetails();
      setRoom(response); // เก็บข้อมูลดิบลง State
    } catch(error: any) {
      console.error("Error fetching room data:", error);

      // 🌟 ดักเคส: ถ้า API ตอบกลับมาว่าหาห้องไม่เจอ (404)
      if (error.response?.status === 404) {
        Swal.fire({
          title: 'Room Not Found',
          text: "Not found this room",
          icon: 'warning',
          confirmButtonColor: '#8370ff', // สีม่วงเข้มให้เข้าธีมเว็บ
        })
        return;
      }

      // 🌟 ดักเคส: Error อื่นๆ (เช่น เซิร์ฟเวอร์ล่ม, เน็ตหลุด)
      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#8370ff',
      });
    }
  }, []);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

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