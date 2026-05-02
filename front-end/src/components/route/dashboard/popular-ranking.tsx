import { PopularRoomResponse } from "@/utils/interface/response";
import { RoomRankCard, RoomRankCardSkeleton } from "./room-rank-card";
import { Info } from "lucide-react"; // 🌟 1. อย่าลืม import Info

// 🌟 2. เผื่อ type ให้รองรับ null ด้วย
export default function PopularRanking({ popularRooms } : { popularRooms?: PopularRoomResponse[] | null }) {
  const isLoading = popularRooms === undefined; 
  
  // 🌟 3. เช็คทั้ง null และ array ว่าง
  const isEmpty = popularRooms === null || popularRooms?.length === 0;

  return (
    <div className="flex-2 bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-lg transition-colors">
      
      <h3 className="text-sm font-bold text-light-muted dark:text-gray-400 uppercase tracking-widest mb-8">
        Popular Rankings
      </h3>
      
      <div className="flex flex-col gap-6">
        {isLoading ? (
          // สถานะกำลังโหลด
          [1, 2, 3].map((i) => (
            <RoomRankCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : isEmpty ? (
          // 🌟 4. กล่องไม่มีข้อมูลแบบใหม่ (เส้นประ + ไอคอน Info)
          <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 dark:bg-white/2 rounded-xl border border-dashed border-gray-200 dark:border-white/10 transition-colors">
            <Info className="w-6 h-6 text-light-secondary dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-light-main dark:text-gray-400">No rooms booked this month.</p>
            <p className="text-xs text-light-secondary dark:text-gray-500 mt-1">Bookings will appear here once made.</p>
          </div>
        ) : (
          // สถานะมีข้อมูล
          popularRooms?.map((room) => (
            <div key={room.id}>
              <RoomRankCard popularRooms={room} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}