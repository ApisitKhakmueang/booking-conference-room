import { PopularRoomResponse } from "@/utils/interface/response";
import { RoomRankCard, RoomRankCardSkeleton } from "./room-rank-card";

export default function PopularRanking({ popularRooms } : { popularRooms?: PopularRoomResponse[] }) {
  const isLoading = !popularRooms || popularRooms.length === 0; // สมมติว่า ถ้า popularRooms ยังไม่มีข้อมูล หรือเป็น array ว่าง แสดงว่าอยู่ในสถานะ loading

  return (
    <div className="flex-2 bg-card border border-white/5 rounded-2xl p-6 shadow-lg">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Popular Rankings</h3>
      
      <div className="flex flex-col gap-6">
        {/* ⏳ ถ้ากำลังโหลด ให้ลูป Skeleton 3 อัน */}
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <RoomRankCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          /* ✅ ถ้าโหลดเสร็จแล้ว ให้ map ข้อมูลจริง */
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