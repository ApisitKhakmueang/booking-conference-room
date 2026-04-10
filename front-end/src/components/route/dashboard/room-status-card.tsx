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
          {/* วงแหวนพื้นหลัง: สีเทาอ่อนใน Light, สีขาวโปร่งใน Dark */}
          <circle cx="48" cy="48" r="36" className="stroke-gray-200 dark:stroke-white/5 fill-none transition-colors" strokeWidth="6" />
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
      <span className="text-[10px] text-light-secondary dark:text-gray-500 font-bold uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
};

export default function RoomStatusCard({ rooms }: {rooms: RoomResp[]}) {
  const countedAmoutRoom = useMemo(() => {
    return BookingStatus(rooms);
  }, [rooms]);

  const isInitialLoading = !rooms || rooms.length === 0;

  return (
    // 🌟 พื้นหลังการ์ด: ขาว (Light) / เทาเข้ม (Dark)
    <div className="flex-3 bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-lg transition-colors">
      
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold text-light-muted dark:text-gray-400 uppercase tracking-widest">Room status</h3>
        {/* 🌟 Live Status Badge: ใช้สี Success ตาม Theme */}
        <span className="text-[10px] text-success flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span> Live Status
        </span>
      </div>
      
      <div className="grid md:grid-cols-4 grid-cols-2 items-center px-4">
        {isInitialLoading ? (
          
          /* ⏳ Skeleton: ใช้สีเทา (Light) / ขาวโปร่ง (Dark) */
          [1, 2, 3, 4].map((i) => (
            <div key={`skeleton-${i}`} className="flex flex-col items-center animate-pulse">
              <div className="w-24 h-24 rounded-full border-[6px] border-gray-200 dark:border-white/10 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded-md"></div>
              </div>
              <div className="h-2.5 w-16 bg-gray-200 dark:bg-white/10 rounded mt-3"></div>
            </div>
          ))

        ) : (
          
          /* ✅ ข้อมูลจริง */
          countedAmoutRoom.map((item) => (
            <CircleChart 
              key={item.name} 
              value={item.amount} 
              total={countedAmoutRoom[0]?.amount} 
              label={item.name} 
              // 🌟 ตัวเลขตรงกลาง: ดำ (Light) / ขาว (Dark)
              colorClass="text-light-main dark:text-white" 
              // 🌟 สีเส้นกราฟ: ถ้าเป็น Total ให้สีดำ(Light)/ขาว(Dark), ถ้าเป็นอันอื่นให้ใช้ dark-purple
              strokeClass={item.name === 'Total' ? 'stroke-gray-800 dark:stroke-white' : 'stroke-dark-purple'} 
            />
          ))
          
        )}
      </div>
    </div>
  )
}