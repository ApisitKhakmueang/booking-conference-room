'use client'

import RoomsGrid, { RoomGridSkeleton } from "./room-grid";
import RoomStatus from "./room-status";
import useBookingStatusWS from "@/hooks/data/useBookingStatusWS";
import { useMemo, useState } from 'react';
import { RoomResp } from '@/utils/interface/response';
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, LayoutGrid } from "lucide-react";
import RoomTimeline from "./room-timeline";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DisplayRooms } from "@/lib/booking-status";
import { useRoomData } from "@/hooks/data/useRoomData";
import { useAuthStore } from "@/stores/auth.store";

export default function Room() {
  const router = useRouter()

  const user = useAuthStore((state) => state.user);

  const { bookings, isLoadingBooking } = useBookingStatusWS();
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const { room: rawRoom, isLoading, isError } = useRoomData();

  // 🌟 2. ใช้ useMemo ผสมร่างข้อมูลแทนการใช้ useEffect -> setRoom
  // มันจะคำนวณใหม่ให้อัตโนมัติ เฉพาะตอนที่ rawRooms หรือ bookings มีการเปลี่ยนแปลงเท่านั้น
  const displayRooms:RoomResp[] = useMemo(() => {
    return DisplayRooms(rawRoom, bookings)
  }, [rawRoom, bookings]); // คำนวณใหม่เมื่อสองตัวนี้เปลี่ยน

  const isInitialLoading = !rawRoom || rawRoom.length === 0;

  return (
    <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isLoadingBooking ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      {/* 🌟 3. Header ปุ่มสลับมุมมอง (วางไว้บนสุด หรือแทรกในหน้า Page.tsx ก็ได้) */}
      <div className="flex md:flex-row flex-col md:justify-between gap-2 pb-4 border-b border-white/5">
        <p className="text-2xl font-semibold text-light-secondary dark:text-secondary">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/calendar')}
            className="py-2 px-4 bg-transparent border border-dark-purple text-dark-purple hover:bg-dark-purple/10 dark:border-sidebar dark:text-stone-400 dark:hover:bg-sidebar/20 shadow-none text-sm font-medium cursor-pointer rounded whitespace-nowrap transition-all gap-2"
            >
              <Calendar className="w-4 h-4" />
              Calendar View
          </Button>
          
          <Button  
            onClick={() => setViewMode(viewMode === 'grid' ? 'timeline' : 'grid')}
            className="py-2 px-4 bg-transparent border border-dark-purple text-dark-purple hover:bg-dark-purple/10 dark:border-sidebar dark:text-stone-400 dark:hover:bg-sidebar/20 shadow-none text-sm font-medium cursor-pointer rounded whitespace-nowrap transition-all gap-2"
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