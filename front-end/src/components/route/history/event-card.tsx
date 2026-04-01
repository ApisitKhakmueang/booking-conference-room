import { EventCardHistoryProps } from "@/utils/interface/interface";
import { formatTimeWithSuffix } from "@/lib/time";
import { format } from "date-fns";

const STATUS_THEME: Record<string, { text: string; bg: string; shadow: string }> = {
  Completed: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500 dark:bg-emerald-400",
    shadow: "shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_8px_rgba(52,211,153,0.6)]"
  },
  Cancelled: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500 dark:bg-rose-400",
    shadow: "shadow-[0_0_8px_rgba(244,63,94,0.4)] dark:shadow-[0_0_8px_rgba(251,113,133,0.6)]"
  }
};

export default function CardEvents({ event, setCurrentDate } : EventCardHistoryProps) {
  const eventDate = new Date(event.date)
  const formattedDate = event.date ? format(eventDate, 'EEEE, dd MMM yyyy') : '';
  const start = formatTimeWithSuffix(event.startTime)
  const end = formatTimeWithSuffix(event.endTime)
  const theme = STATUS_THEME[event.status] || STATUS_THEME['confirm'];

  return (
    <div 
      className="group flex gap-6 md:p-6 p-4 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300"
    >
      
      {/* 🌟 2. โซนเวลาด้านซ้าย */}
      <div className="w-20 pt-1 text-right border-r border-gray-200 dark:border-white/10 pr-6">
        {/* สีเวลาหลัก */}
        <span className="block font-bold text-lg text-gray-800 dark:text-neutral-100">{start.time}</span>
        {/* สี AM/PM */}
        <span className="block text-[12px] text-gray-500 dark:text-stone-500 uppercase">{start.suffix}</span>
        <span className="block text-[10px] text-gray-400 dark:text-stone-500 uppercase my-0.5">to</span>
        
        <span className="block font-bold text-lg text-gray-800 dark:text-neutral-100">{end.time}</span>
        <span className="block text-[12px] text-gray-500 dark:text-stone-500 uppercase">{end.suffix}</span>
      </div>

      {/* 🌟 3. โซนรายละเอียดด้านขวา */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          {/* Badge ชื่อห้อง: ใช้สีม่วงอ่อน (light-card) คล้ายๆ ในรูป */}
          <span className="px-3 py-1 rounded-full bg-light-purple text-dark-purple dark:bg-purple-500/20 dark:text-purple-300 text-[10px] font-bold uppercase tracking-widest">
            {event?.room?.name}
          </span>
        </div>
        
        {/* ชื่อ Title การจอง */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-1">{event.title}</h3>
        
        {/* วันที่การจอง */}
        <p className="text-sm text-gray-500 dark:text-stone-400">{formattedDate}</p>
        
        {/* แถบด้านล่าง: Status และ Duration */}
        <div className="mt-4 flex xs:flex-row flex-col xs:items-center xs:gap-4 gap-1 text-xs">
          
          <span className={`flex items-center gap-1.5 font-medium ${theme.text}`}>
            <span className={`w-2 h-2 rounded-full ${theme.bg} ${theme.shadow}`}></span> 
            <span className="capitalize">{event.status}</span>
          </span>
          
          <span className="text-gray-500 dark:text-stone-500 flex items-center gap-1 xs:border-l xs:pl-4 border-gray-200 dark:border-white/10">
            <span className="material-symbols-outlined text-sm">schedule</span> {event.duration}
          </span>

        </div>
      </div>
    </div>
  )
}

export function CardEventsSkeleton() {
  return (
    <div className="flex gap-6 p-4 md:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar animate-pulse">
      
      {/* 🌟 โซนเวลาด้านซ้าย (Skeleton) */}
      <div className="w-20 pt-1 flex flex-col items-end border-r border-gray-200 dark:border-white/10 pr-6 gap-1">
        <div className="h-6 w-12 bg-gray-200 dark:bg-white/10 rounded"></div>
        <div className="h-3 w-6 bg-gray-200 dark:bg-white/10 rounded mb-1"></div>
        <div className="h-2 w-4 bg-gray-200 dark:bg-white/5 rounded my-0.5"></div>
        <div className="h-6 w-12 bg-gray-200 dark:bg-white/10 rounded mt-1"></div>
        <div className="h-3 w-6 bg-gray-200 dark:bg-white/10 rounded"></div>
      </div>

      {/* 🌟 โซนรายละเอียดด้านขวา (Skeleton) */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          {/* Badge Skeleton */}
          <div className="h-5 w-16 bg-gray-200 dark:bg-white/10 rounded-full"></div>
          {/* Button Skeleton */}
          <div className="h-7 w-7 bg-gray-200 dark:bg-white/10 rounded"></div>
        </div>
        
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-white/10 rounded mb-2"></div>
        
        {/* Date Skeleton */}
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded"></div>
        
        {/* แถบด้านล่าง (Status และ Duration) Skeleton */}
        <div className="mt-5 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/10"></div> 
            <div className="h-3 w-12 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
          
          <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-white/10 pl-4">
            <div className="h-4 w-4 bg-gray-200 dark:bg-white/10 rounded-full"></div>
            <div className="h-3 w-10 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
      
    </div>
  )
}