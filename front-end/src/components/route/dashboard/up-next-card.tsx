'use client';

import { Button } from '@/components/ui/button';
import { mapBookingEvents } from '@/lib/map-resp-event';
import { formatTimeWithSuffix } from '@/lib/time';
import { bookingService } from '@/service/booking.service';
import { BookingEvent } from '@/utils/interface/interface';
import { format } from 'date-fns';
import { 
  CalendarClock, MapPin, Clock, Info
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UpNextCard({ handleEditClick }: { handleEditClick: (event: BookingEvent) => void }) {
  const [event, setEvent] = useState<BookingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🌟 1. เพิ่ม State สำหรับ Loading

  const fetchUpNextBooking = async () => {
    setIsLoading(true);
    const now = format(new Date(), 'yyyy-MM-dd');
    try {
      const response = await bookingService.fetchBookingUpNext(now);
      if (response) {
        const mapBooking = mapBookingEvents(response);
        setEvent(mapBooking);
      } else {
        setEvent(null);
      }
    } catch (error) {
      console.log("error: ", error);
      setEvent(null);
    } finally {
      setIsLoading(false); // 🌟 โหลดเสร็จแล้ว (ไม่ว่าจะพังหรือสำเร็จ) ปิด Loading
    }
  }

  useEffect(() => {
    fetchUpNextBooking();
  }, []);

  // โครงสร้างพื้นหลัง (ใช้ร่วมกันทั้งตอน Loading, ว่าง, และมีข้อมูล)
  return (
    <div className="flex-[2] bg-linear-to-br from-[#1e1e24] to-[#121215] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden group min-h-[250px] flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      <CalendarClock className="absolute -bottom-10 -right-10 w-64 h-64 text-white/[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block relative z-10">Up Next</span>

      {/* ⏳ 2. สถานะ: กำลังโหลด (Skeleton) */}
      {isLoading ? (
        <div className="relative z-10 w-full animate-pulse">
          {/* ชื่อการประชุม (Skeleton) */}
          <div className="h-10 w-3/4 bg-white/10 rounded-lg mb-6"></div>
          
          <div className="flex items-center gap-4 mb-8">
            {/* ห้อง (Skeleton) */}
            <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
            {/* เวลา (Skeleton) */}
            <div className="h-10 w-48 bg-white/10 rounded-lg"></div>
          </div>
          
          {/* ปุ่ม (Skeleton) */}
          <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
        </div>
      ) 
      
      /* 📭 3. สถานะ: ไม่มีรายการจองถัดไป (Empty State) */
      : !event ? (
        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
          <Info className="w-8 h-8 text-white/20 mb-3" />
          <h2 className="text-xl font-bold text-gray-400">No Upcoming Meetings</h2>
          <p className="text-sm text-gray-500 mt-1">You don't have any bookings left for today.</p>
        </div>
      ) 
      
      /* ✅ 4. สถานะ: มีข้อมูล (แสดงเนื้อหาจริง) */
      : (
        // 💡 พอมาถึงตรงนี้ TypeScript รู้แล้วว่า event ไม่ใช่ null แน่นอน เลยดึงค่ามาใช้งานได้โดยไม่ error
        (() => {
          const start = formatTimeWithSuffix(event.startTime);
          const end = formatTimeWithSuffix(event.endTime);

          return (
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight line-clamp-1">{event.title}</h2>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">{event.room?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    {start.time} {start.suffix === end.suffix ? '' : `${start.suffix} `}to {end.time} {end.suffix}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleEditClick(event)}
                  className="bg-[#8370ff] hover:bg-[#9180ff] text-white font-medium px-5 py-2.5 rounded-lg border border-white/10 transition-colors cursor-pointer shadow-lg shadow-[#8370ff]/20">
                  Reschedule
                </Button>
              </div>
            </div>
          );
        })() // 👈 ใช้ IIFE (Immediately Invoked Function Expression) เพื่อรันฟังก์ชันและ return UI ออกมา
      )}
    </div>
  )
}