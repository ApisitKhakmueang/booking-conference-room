import { Button } from "@/components/ui/button";
import { EventCardProps } from "@/utils/interface/interface";
import { formatTimeWithSuffix } from "@/utils/time";
import { format } from "date-fns";
import { X } from "lucide-react";

export default function CardEvents({ event, setIsAddModalOpen, setCurrentDate } : EventCardProps) {
  const eventDate = new Date(event.date)
  const formattedDate = event.date ? format(eventDate, 'EEEE, dd MMM yyyy') : '';
  const start = formatTimeWithSuffix(event.startTime)
  const end = formatTimeWithSuffix(event.endTime)

  return (
    <div 
      onClick={() => {
        setIsAddModalOpen(true)
        setCurrentDate(eventDate)
      }}
      // 🌟 1. ปรับ Background ของ Card:
      // Light: bg-white ขอบเทาอ่อน โฮเวอร์เปลี่ยนเป็นเทาจางๆ
      // Dark: bg-sidebar โฮเวอร์เปลี่ยนเป็น hover
      className="group flex gap-6 p-4 md:p-6 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 cursor-pointer"
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

          <Button className="p-1.5 text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-hover hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* ชื่อ Title การจอง */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-1">{event.title}</h3>
        
        {/* วันที่การจอง */}
        <p className="text-sm text-gray-500 dark:text-stone-400">{formattedDate}</p>
        
        {/* แถบด้านล่าง: Status และ Duration */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          
          <span className="flex items-center gap-1.5 text-success dark:text-purple-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-success dark:bg-purple-400 shadow-[0_0_8px_rgba(65,205,139,0.4)] dark:shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> 
            <span className="capitalize">{event.status}</span>
          </span>
          
          <span className="text-gray-500 dark:text-stone-500 flex items-center gap-1 border-l border-gray-200 dark:border-white/10 pl-4">
            <span className="material-symbols-outlined text-sm">schedule</span> {event.duration}
          </span>

        </div>
      </div>
    </div>
  )
}