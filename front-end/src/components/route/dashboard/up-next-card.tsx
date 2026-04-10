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
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function UpNextCard({ handleEditClick }: { handleEditClick: (event: BookingEvent) => void }) {
  const [event, setEvent] = useState<BookingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUpNextBooking = async () => {
    setIsLoading(true);
    const now = format(new Date(), 'yyyy-MM-dd');
    try {
      const response = await bookingService.fetchBookingUpNext(now);
      if (response) {
        const mapBooking = mapBookingEvents(response);
        console.log("mapBooking: ", mapBooking);
        setEvent(mapBooking);
      } else {
        setEvent(null);
      }
    } catch (error: any) {
      if (error.response?.status === 500) {
        Swal.fire({
          title: 'Error',
          text: "Date format is invalid or missing",
          icon: 'warning',
          confirmButtonColor: '#b495ff', 
        })
        return;
      }

      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUpNextBooking();
  }, []);

  return (
    // 🌟 1. พื้นหลังการ์ด: Light ใช้สีขาว (light-main-background) / Dark ใช้ Gradient เดิม
    <div className="flex-2 bg-light-main-background dark:bg-linear-to-br dark:from-[#1e1e24] dark:to-[#121215] border border-gray-200 dark:border-white/5 rounded-2xl p-8 shadow-lg relative overflow-hidden group min-h-[250px] flex flex-col justify-center transition-colors">
      
      {/* 🌟 2. เอฟเฟกต์แสงมุมขวา: Light ใช้สีม่วงอ่อนๆ / Dark ใช้สี Indigo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-dark-purple/50 dark:from-indigo-500/10 to-transparent pointer-events-none" />
      
      {/* 🌟 3. ลายน้ำ Icon พื้นหลัง */}
      {/* <CalendarClock className="absolute -bottom-10 -right-10 w-64 h-64 text-dark-purple/5 dark:text-white/2 pointer-events-none group-hover:scale-110 transition-transform duration-700" /> */}

      <Image
        src='/logo/logoEE-White.png'
        alt="logo"
        width={256}
        height={256}
        className='absolute right-0 opacity-50 dark:opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700'
      />
      
      <span className="text-xs font-bold text-light-muted dark:text-gray-500 uppercase tracking-widest mb-2 block relative z-10">Up Next</span>

      {/* ⏳ สถานะ: กำลังโหลด (Skeleton) */}
      {isLoading ? (
        <div className="relative z-10 w-full animate-pulse">
          <div className="h-10 w-3/4 bg-gray-200 dark:bg-white/10 rounded-lg mb-6"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-10 w-48 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
        </div>
      ) 
      
      /* 📭 สถานะ: ไม่มีรายการจองถัดไป (Empty State) */
      : !event ? (
        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
          <Info className="w-8 h-8 text-gray-300 dark:text-white/20 mb-3" />
          <h2 className="text-xl font-bold text-light-main dark:text-gray-400">No Upcoming Meetings</h2>
          <p className="text-sm text-light-secondary dark:text-gray-500 mt-1">You don't have any bookings left for today.</p>
        </div>
      ) 
      
      /* ✅ สถานะ: มีข้อมูล (แสดงเนื้อหาจริง) */
      : (
        (() => {
          const start = formatTimeWithSuffix(event.startTime);
          const end = formatTimeWithSuffix(event.endTime);

          return (
            <div className="relative z-10">
              {/* 🌟 4. ชื่อการประชุม: สีดำใน Light / ขาวใน Dark */}
              <h2 className="text-4xl font-bold text-light-main dark:text-white mb-6 tracking-tight line-clamp-1">
                {event.title}
              </h2>
              
              <div className="flex items-center gap-4 mb-8">
                {/* 🌟 5. Badge ห้องประชุม: พื้นหลังม่วงอ่อนใน Light / ขาวโปร่งใน Dark */}
                <div className="flex items-center gap-2 bg-light-purple dark:bg-white/5 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
                  <MapPin className="w-4 h-4 text-dark-purple dark:text-gray-400" />
                  <span className="text-light-secondary dark:text-gray-300 font-medium">
                    {event.room?.name || 'N/A'}
                  </span>
                </div>
                
                {/* 🌟 6. Badge เวลา */}
                <div className="flex items-center gap-2 bg-light-purple dark:bg-white/5 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
                  <Clock className="w-4 h-4 text-dark-purple dark:text-gray-400" />
                  <span className="text-light-secondary dark:text-gray-300 font-medium">
                    {start.time} {start.suffix === end.suffix ? '' : `${start.suffix} `}to {end.time} {end.suffix}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                {/* 🌟 7. ปุ่มกด: ดึงสีตรงจาก Theme เลย (bg-dark-purple -> hover:bg-light-card) */}
                <Button 
                  onClick={() => handleEditClick(event)}
                  className="bg-dark-purple hover:bg-light-card text-white font-medium px-5 py-2.5 rounded-lg border border-transparent dark:border-white/10 transition-colors cursor-pointer shadow-lg shadow-dark-purple/20">
                  Reschedule
                </Button>
              </div>
            </div>
          );
        })()
      )}
    </div>
  )
}