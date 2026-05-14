import { formatTimeWithSuffix } from "@/lib/time";
import { ParsedBookingEvent } from "@/utils/interface/response";
import { Users } from "lucide-react";
import { differenceInMinutes } from 'date-fns/differenceInMinutes';
import { useEffect, useState } from "react";

export default function BookingCard({ booking }: { booking: ParsedBookingEvent }) {
  const start = formatTimeWithSuffix(booking.startTime)
  const end = formatTimeWithSuffix(booking.endTime)

  // 🌟 1. สร้าง State สำหรับเก็บเวลาปัจจุบัน
  const [now, setNow] = useState(new Date());

  // 🌟 2. สั่งให้เวลาอัปเดตทุกๆ 1 นาที เพื่อให้ Countdown ทำงาน
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 🌟 3. รับค่าเป็น Date หรือ String ก็ได้เพื่อความปลอดภัย
  const getEndsInText = (endTime: Date | string) => {
    if (!endTime) return '';
    
    // แปลงให้เป็น Date Object ชัวร์ๆ ก่อนคำนวณ
    const endObj = typeof endTime === 'string' ? new Date(endTime) : endTime;
    const mins = differenceInMinutes(endObj, now); // ใช้ state 'now' แทน new Date()
    
    if (mins <= 0) return 'Ending...'; // รวบกรณี 0 นาทีเข้ามาด้วย
    
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      // ถ้านาทีที่เหลือเป็น 0 ไม่ต้องโชว์ 0m (เช่น โชว์แค่ "Ends in 1h")
      return remainingMins > 0 ? `Ends in ${hrs}h ${remainingMins}m` : `Ends in ${hrs}h`;
    }
    
    return `Ends in ${mins}m`;
  };

  return (
    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white/10 rounded-lg text-gray-300">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">{booking.Room?.name || `Room ${booking.Room?.id}`}</p>
          {/* แสดงชื่อการประชุมเล็กๆ ไว้ด้านล่างถ้ามี */}
          {booking.title && <p className="text-[10px] text-gray-500 line-clamp-1">{booking.title}</p>}
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className="text-xs font-bold text-white mb-0.5">
          {getEndsInText(booking.endTime)}
        </p>
        <p className="text-[10px] text-gray-500">{start.time} {start.suffix === end.suffix ? '' : `${start.suffix} `}to {end.time} {end.suffix}</p>
      </div>
    </div>
  )
}