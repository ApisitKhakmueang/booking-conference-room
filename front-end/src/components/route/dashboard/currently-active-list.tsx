import { BookingEventResponse } from '@/utils/interface/response';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';
import { parseISO } from 'date-fns/parseISO';
import { 
  Video, Users,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function CurrentlyActiveList({ bookings, isLoadingBooking }: { bookings: BookingEventResponse[], isLoadingBooking: boolean }) {
  const router = useRouter()
  const [now, setNow] = useState(new Date());
  
  const getEndsInText = (endTime: string) => {
    if (!endTime) return '';
    const mins = differenceInMinutes(parseISO(endTime), new Date());
    
    if (mins < 0) return 'Ending...';
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `Ends in ${hrs}h ${remainingMins}m`;
    }
    return `Ends in ${mins}m`;
  };
  
  const endInText = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    return bookings.map(booking => ({
      id: booking.id,
      endInText: getEndsInText(booking.endTime)
    }));
  }, [now]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-2 bg-card border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-full">
      
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
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar">
        
        {/* ⏳ 1. สถานะกำลังโหลด (Skeleton Loading) */}
        {isLoadingBooking ? (
          <>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-white/10 rounded"></div>
                    <div className="h-2 w-16 bg-white/10 rounded"></div>
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
            <div key={booking.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg text-gray-300">
                  {/* สุ่มสลับไอคอน หรือจะดึงตาม Capacity ของห้องก็ได้ครับ */}
                  {booking.Room?.capacity && booking.Room.capacity > 8 ? <Users className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{booking.Room?.name || `Room ${booking.Room?.id}`}</p>
                  {/* แสดงชื่อการประชุมเล็กๆ ไว้ด้านล่างถ้ามี */}
                  {booking.title && <p className="text-[10px] text-gray-500 line-clamp-1">{booking.title}</p>}
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-xs font-bold text-white mb-0.5">
                  {endInText.find(item => item.id === booking.id)?.endInText || ''}
                </p>
              </div>
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