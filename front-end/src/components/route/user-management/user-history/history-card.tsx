import { BookingHistoryItem } from '@/utils/interface/response';
import { format, differenceInMinutes, parseISO } from 'date-fns';

interface HistoryCard {
  booking: BookingHistoryItem
}

export default function HistoryCard({ booking }: HistoryCard) {
  // (ส่วนจัดการตัวแปรเวลา Date-fns และ Status ยังคงเดิม)
  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);
  const dateStr = format(start, 'dd MMM'); 
  const yearStr = format(start, 'yyyy');   
  const timeStr = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`; 
  const diffMins = differenceInMinutes(end, start);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  const durationStr = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`; 

  const statusMap: Record<string, string> = {
    'confirm': 'CONFIRMED', 'complete': 'COMPLETED',
    'cancelled': 'CANCELLED', 'no_show': 'NO-SHOW'
  };
  const uiStatus = statusMap[booking.status] || 'COMPLETED';
  const statusConfig: Record<string, { text: string; dot: string }> = {
    'CONFIRMED': { 
      text: 'text-dark-purple dark:text-purple-400', 
      dot: 'bg-dark-purple dark:bg-purple-400 shadow-[0_0_8px_var(--color-dark-purple)]' 
    },
    'COMPLETED': { 
      text: 'text-emerald-500 dark:text-emerald-400', 
      dot: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px] shadow-emerald-500/60' 
    },
    'CANCELLED': { 
      text: 'text-rose-500 dark:text-rose-400', 
      dot: 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_8px] shadow-rose-500/60' 
    },
    'NO-SHOW': { 
      text: 'text-orange-500 dark:text-orange-400', 
      dot: 'bg-orange-500 dark:bg-orange-400 shadow-[0_0_8px] shadow-orange-500/60' 
    },
  };
  const config = statusConfig[uiStatus];

  return (
    // 🌟 1. เปลี่ยน Wrapper จาก flex-col เป็น grid-cols-2 สำหรับมือถือ
    <div className="relative grid grid-cols-2 md:flex md:flex-row md:items-center p-4 md:p-5 bg-white border border-gray-100 hover:bg-light-purple shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 rounded-2xl gap-y-3 md:gap-y-0 gap-x-2 md:gap-x-0 mb-3">
      
      {/* 2. Date (Mobile: กินพื้นที่ 1 คอลัมน์ ซ้ายมือ / Desktop: 25%) */}
      <div className="col-span-1 md:w-[20%] flex flex-col">
        <span className="font-bold text-light-main dark:text-main text-base leading-tight">{dateStr}</span>
        <span className="text-[11px] text-light-secondary dark:text-secondary font-medium">{yearStr}</span>
      </div>

      {/* 3. Time & Duration (Mobile: กินพื้นที่ 1 คอลัมน์ ขวามือ / Desktop: 30%) */}
      {/* 🌟 บนมือถือให้ชิดขวา (items-end) แต่จอคอมให้ชิดซ้าย (md:items-start) เพื่อความสวยงาม */}
      <div className="col-span-1 md:w-[35%] flex flex-col items-end md:items-start">
        <span className="text-sm font-bold text-light-main dark:text-main">{timeStr}</span>
        <span className="text-xs text-light-secondary dark:text-secondary font-medium">{durationStr}</span>
      </div>

      <div className="col-span-2 md:hidden w-full h-px bg-gray-100 dark:bg-white/5"></div>

      {/* 4. Room (Mobile: กินเต็ม 2 คอลัมน์ / Desktop: 35%) */}
      <div className="col-span-1 md:w-[35%] flex flex-col pt-3 md:pt-0">
        <span className="text-sm font-bold text-light-main dark:text-main">{booking.Room?.name}</span>
        <span className="text-[10px] text-light-secondary dark:text-secondary uppercase tracking-wider">{booking.Room?.location}</span>
      </div>

      {/* 5. Status (Mobile: กินเต็ม 2 คอลัมน์ / Desktop: 10%) */}
      <div className="col-span-1 md:w-[10%] flex items-center gap-2 pt-3 md:pt-0">
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>{uiStatus}</span>
      </div>

    </div>
  );
}