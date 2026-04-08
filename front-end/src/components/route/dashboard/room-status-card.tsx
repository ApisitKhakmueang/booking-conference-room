import { BookingStatus } from "@/lib/booking-status";
import { RoomResp } from "@/utils/interface/response";
import { useMemo } from "react";

const CircleChart = ({ value, total, label, colorClass, strokeClass }: { value: number, total: number, label: string, colorClass: string, strokeClass: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? value / total : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="36" className="stroke-white/5 fill-none" strokeWidth="6" />
          <circle 
            cx="48" cy="48" r="36" 
            className={`fill-none ${strokeClass} transition-all duration-1000 ease-out`} 
            strokeWidth="6" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
          />
        </svg>
        <span className={`absolute text-xl font-bold ${colorClass}`}>{value}</span>
      </div>
      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
};

export default function RoomStatusCard({ rooms }: {rooms: RoomResp[]}) {
  const countedAmoutRoom = useMemo(() => {
    return BookingStatus(rooms);
  }, [rooms]);

  const isInitialLoading = !rooms || rooms.length === 0;

  return (
    <div className="flex-3 bg-card border border-white/5 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Room status</h3>
        <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Live Status</span>
      </div>
      
      <div className="flex justify-between items-center px-4">
        {countedAmoutRoom.map((item) => (
          <CircleChart key={item.name} value={item.amount} total={countedAmoutRoom[0]?.amount} label={item.name} colorClass="text-white" strokeClass={item.name === 'Total' ? 'stroke-white' : 'stroke-dark-purple'} />
        ))}
      </div>
    </div>
  )
}