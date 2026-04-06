import { formatTimeWithSuffix } from "@/lib/time";
import { BookingEvent } from "@/utils/interface/interface";
import { format } from "date-fns";
import { CalendarCheck, CalendarDays, Clock, User } from "lucide-react";

// 🌟 สร้าง Interface เพื่อให้รับค่า Props ได้ (ถ้าใช้ TypeScript)
interface BookingCard {
  booking: BookingEvent
}

export default function BookingCard({ booking }: BookingCard) {
  const eventDate = new Date(booking.date)
  const formattedDate = booking.date ? format(eventDate, 'EEEE, dd MMM yyyy') : '';
  const start = formatTimeWithSuffix(booking.startTime)
  const end = formatTimeWithSuffix(booking.endTime)

  return (
    <div className="bg-[#1a1825] border border-[#a78bfa]/20 rounded-3xl p-6 flex items-center gap-6 w-full shadow-lg h-full">
      
      {/* ส่วนไอคอน */}
      <div className="w-16 h-16 rounded-2xl bg-[#2a2440] flex items-center justify-center shrink-0 border border-white/5">
        <CalendarCheck className="text-[#a78bfa] w-8 h-8" strokeWidth={1.5} />
      </div>

      {/* เส้นแบ่ง */}
      <div className="h-14 w-px bg-white/10 shrink-0"></div>

      {/* ข้อมูลการจอง */}
      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-white text-[22px] font-bold tracking-wide truncate">
          {booking.title}
        </h3>

        <div className="flex xs:flex-row flex-col xs:items-center items-start xs:gap-2 gap-0 text-checkin text-[14px] font-semibold mt-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{start.time} {start.suffix} to {end.time} {end.suffix}</span>
          <span className="text-[#a78bfa]/60 text-[13px] font-normal ml-1">
            ({booking.duration})
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-[13px] font-medium mt-1.5">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <User className="text-gray-400 w-4 h-4 shrink-0" strokeWidth={2.5} />
          <span className="text-gray-400 text-sm font-medium truncate">
            {booking.user.fullName}
          </span>
        </div>
      </div>
      
    </div>
  );
}