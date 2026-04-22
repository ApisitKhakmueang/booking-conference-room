import { BookingEventResponse } from '@/utils/interface/response';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BookingCard from './booking-card';

export default function CurrentlyActiveList({ bookings, isLoadingBooking }: { bookings: BookingEventResponse[], isLoadingBooking: boolean }) {
  const router = useRouter()

  return (
    // 🌟 พื้นหลังการ์ด
    <div className="flex-2 bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-lg flex flex-col max-h-full transition-colors">
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-light-muted dark:text-gray-400 uppercase tracking-widest">Currently Active</h3>
        {/* 🌟 Monitoring Badge: ใช้สีม่วงเข้ม (Light) / ม่วงสว่าง (Dark) */}
        <span 
          onClick={() => router.push('/rooms')}
          className="text-[10px] text-dark-purple dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:opacity-80"
        >
          <span className="w-1.5 h-1.5 bg-dark-purple dark:bg-indigo-400 rounded-full animate-pulse"></span>
          Monitoring
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar max-h-40">
        
        {/* ⏳ Skeleton Loading */}
        {isLoadingBooking ? (
          <>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded"></div>
              </div>
            ))}
          </>
        ) 
        
        /* ✅ ข้อมูลจริง */
        : bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} >
              {/* 💡 อย่าลืมไปปรับ Light Theme ใน BookingCard ด้วยนะครับ (ถ้ายังไม่ได้ทำ) */}
              <BookingCard booking={booking} />
            </div>
          ))
        ) 
        
        /* 📭 ว่างเปล่า (Empty State) */
        : (
          // 🌟 กรอบไม่มีข้อมูล: เทาอ่อน (Light) / ขาวโปร่งแสง (Dark)
          <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 dark:bg-white/2 rounded-xl border border-dashed border-gray-200 dark:border-white/10 transition-colors">
            <Info className="w-6 h-6 text-light-secondary dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-light-main dark:text-gray-400">No rooms are currently in use.</p>
            <p className="text-xs text-light-secondary dark:text-gray-500 mt-1">All rooms are available right now.</p>
          </div>
        )}
      </div>

    </div>
  )
}