'use client'

import RoomsGrid, { RoomGridSkeleton } from "./room-grid";
import RoomStatus from "./room-status";
import useBookingStatusWS from "@/hooks/data/useBookingStatusWS";
import { useMemo, useState } from 'react';
import { RoomResp } from '@/utils/interface/response';
import { useShallow } from "zustand/shallow";
import { useRoomStore } from "@/stores/room.store";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutGrid } from "lucide-react";
import RoomTimeline from "./room-timeline";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function Room() {
  const router = useRouter()
  const { bookings, isLoadingBooking } = useBookingStatusWS();
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const { rawRoom } = useRoomStore(
    useShallow(((state) => ({
      rawRoom: state.rooms
    })))
  )

  // 🌟 2. ใช้ useMemo ผสมร่างข้อมูลแทนการใช้ useEffect -> setRoom
  // มันจะคำนวณใหม่ให้อัตโนมัติ เฉพาะตอนที่ rawRooms หรือ bookings มีการเปลี่ยนแปลงเท่านั้น
  const displayRooms:RoomResp[] = useMemo(() => {
    if (!rawRoom || rawRoom.length === 0) return [];

    return rawRoom.map((room) => {
      // 2.1 เช็คสถานะปิดปรับปรุงก่อน
      if (room.isActive === 'maintenance') {
        return { ...room, status: 'maintenance' };
      }

      // 2.2 ถ้ายังไม่มี bookings (หรือโหลดไม่เสร็จ) ให้ถือว่าห้องว่างไปก่อน
      if (!bookings || bookings.length === 0) {
        return { ...room, status: 'available' };
      }

      // 2.3 หา booking ที่ตรงกับห้องนี้
      const activeBooking = bookings.find(
        (booking) => booking.Room.id === room.id
      );

      // 2.4 ผสมสถานะลงไปแล้ว Return กลับ
      if (activeBooking) {
        return {
          ...room,
          status: activeBooking.status === 'confirm' ? 'occupied' : 'available',
        };
      }

      // 2.5 ถ้าไม่เจอใน bookings แปลว่าห้องว่าง
      return { ...room, status: 'available' };
    }).sort((a, b) => a.roomNumber - b.roomNumber);
  }, [rawRoom, bookings]); // คำนวณใหม่เมื่อสองตัวนี้เปลี่ยน

  const isInitialLoading = !rawRoom || rawRoom.length === 0;

  return (
    <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isLoadingBooking ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      {/* 🌟 3. Header ปุ่มสลับมุมมอง (วางไว้บนสุด หรือแทรกในหน้า Page.tsx ก็ได้) */}
      <div className="flex md:flex-row flex-col md:justify-between gap-2 pb-4 border-b border-white/5">
        <p className="text-2xl font-semibold">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/calendar')}
            className="p-2 bg-transparent border border-dark-purple text-dark-purple hover:bg-dark-purple/10 dark:border-sidebar dark:text-stone-400 dark:hover:bg-sidebar/20 shadow-none text-sm font-medium cursor-pointer rounded whitespace-nowrap transition-all gap-2"
            >
              Calendar View
          </Button>
          
          <Button  
            onClick={() => setViewMode(viewMode === 'grid' ? 'timeline' : 'grid')}
            className="p-2 bg-transparent border border-dark-purple text-dark-purple hover:bg-dark-purple/10 dark:border-sidebar dark:text-stone-400 dark:hover:bg-sidebar/20 shadow-none text-sm font-medium cursor-pointer rounded whitespace-nowrap transition-all gap-2"
          >
            {viewMode === 'grid' ? (
              <><CalendarDays className="w-4 h-4" /> Timeline View</>
            ) : (
              <><LayoutGrid className="w-4 h-4" /> Grid View</>
            )}
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // 🌟 4. โหมดเดิม (Grid)
        <div className="flex flex-col gap-4">
          <RoomStatus displayRooms={displayRooms} isLoadingBooking={isLoadingBooking} />
          {isInitialLoading ? (
            <RoomGridSkeleton />
          ) : (
            <RoomsGrid displayRooms={displayRooms} bookings={bookings} />
          )}
        </div>
      ) : (
        // 🌟 5. โหมดใหม่ (Timeline)
        <div className="flex-1 min-h-[500px]">
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">Loading Timeline...</div>
          ) : (
            <RoomTimeline rooms={displayRooms} />
          )}
        </div>
      )}
    </div>
  )
}