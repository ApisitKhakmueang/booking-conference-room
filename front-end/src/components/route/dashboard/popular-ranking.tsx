import { PopularRoomResponse } from "@/utils/interface/response";
import { RoomRankCard, RoomRankCardSkeleton } from "./room-rank-card";

export default function PopularRanking({ popularRooms } : { popularRooms?: PopularRoomResponse[] }) {
  // 🌟 ถ้ากำลังโหลดข้อมูล (undefined) หรือเป็น array ว่าง ให้ขึ้น Skeleton
  const isLoading = !popularRooms || popularRooms.length === 0; 

  return (
    // 🌟 พื้นหลังการ์ด: ขาว (Light) / เทาเข้ม (Dark)
    <div className="flex-2 bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-lg transition-colors">
      
      {/* 🌟 หัวข้อ: สีเทากลาง (Light) / สีเทาอ่อน (Dark) */}
      <h3 className="text-sm font-bold text-light-muted dark:text-gray-400 uppercase tracking-widest mb-8">
        Popular Rankings
      </h3>
      
      <div className="flex flex-col gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <RoomRankCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
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