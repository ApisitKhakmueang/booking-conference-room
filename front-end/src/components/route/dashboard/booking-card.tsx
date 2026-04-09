import { formatTimeWithSuffix } from "@/lib/time";
import { BookingEventResponse } from "@/utils/interface/response";
import { Users } from "lucide-react";
import { differenceInMinutes } from 'date-fns/differenceInMinutes';

interface EndInTextProps {
  id: string
  endInText: string
}

export default function BookingCard({ booking }: { booking: BookingEventResponse }) {
  const start = formatTimeWithSuffix(booking.startTime)
  const end = formatTimeWithSuffix(booking.endTime)

  const getEndsInText = (endTime: string) => {
    if (!endTime) return '';
    const mins = differenceInMinutes(endTime, new Date());
    
    if (mins < 0) return 'Ending...';
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `Ends in ${hrs}h ${remainingMins}m`;
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