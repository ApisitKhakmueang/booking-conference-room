import { BookingEventResponse } from '@/utils/interface/response';
import { 
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BookingCard from './booking-card';

export default function CurrentlyActiveList({ bookings, isLoadingBooking }: { bookings: BookingEventResponse[], isLoadingBooking: boolean }) {
  const router = useRouter()
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-2 bg-card border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col max-h-full">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Currently Active</h3>
        <span 
          onClick={() => router.push('/rooms')}
          className="text-[10px] text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
          Monitoring
        </span>
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar max-h-40">
        
        {/* ⏳ 1. สถานะกำลังโหลด (Skeleton Loading) */}
        {isLoadingBooking ? (
          <>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-16 bg-white/10 rounded"></div>
              </div>
            ))}
          </>
        ) 
        
        /* ✅ 2. สถานะมีข้อมูล (Show Bookings) */
        : bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} >
              <BookingCard booking={booking} />
            </div>
          ))
        ) 
        
        /* 📭 3. สถานะว่างเปล่า (Empty State) */
        : (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-white/2 rounded-xl border border-dashed border-white/10">
            <Info className="w-6 h-6 text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-400">No rooms are currently in use.</p>
            <p className="text-xs text-gray-500 mt-1">All rooms are available right now.</p>
          </div>
        )}
      </div>

    </div>
  )
}