import { PopularRoomResponse } from "@/utils/interface/response";
import RoomRankCard from "./room-rank-card";

export default function PopularRanking({ popularRooms } : { popularRooms: PopularRoomResponse[] }) {
  return (
    <div className="flex-2 bg-card border border-white/5 rounded-2xl p-6 shadow-lg">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Popular Rankings</h3>
      
      <div className="flex flex-col gap-6">
        {popularRooms.map((room) => (
          <div key={room.id}>
            <RoomRankCard popularRooms={room} />
          </div>
        ))}
      </div>
    </div>
  )
}