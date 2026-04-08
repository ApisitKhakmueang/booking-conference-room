import { PopularRoomResponse } from "@/utils/interface/response"

interface RoomRankCardProps {
  popularRooms: PopularRoomResponse
}

export function RoomRankCard({ popularRooms }: RoomRankCardProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        {/* ใช้ padStart เผื่อเลขหลักเดียว จะได้เติม 0 ให้ เช่น 01, 02 */}
        <span className="text-3xl font-bold text-white/20 leading-none">
          {String(popularRooms.roomNumber).padStart(2, '0')}
        </span>
        <div className="flex-1 flex flex-col justify-between items-baseline gap-3">
          <div className='flex justify-between w-full'>
            <span className="font-bold text-white">{popularRooms.name}</span>
            <span className="text-xs font-bold text-gray-400">{popularRooms.percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full">
            <div className="h-full bg-[#8370ff] rounded-full transition-all duration-1000" style={{ width: `${popularRooms.percentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 🌟 สร้าง Skeleton Component แยกไว้ในไฟล์เดียวกันเลย
export function RoomRankCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        {/* จำลองตัวเลขใหญ่ด้านซ้าย */}
        <div className="w-9 h-8 bg-white/10 rounded-md"></div>
        
        <div className="flex-1 flex flex-col justify-between items-baseline gap-3">
          <div className='flex justify-between w-full'>
            {/* จำลองชื่อห้อง (ความยาวแบบสุ่มๆ ให้ดูธรรมชาติ) */}
            <div className="w-32 h-4 bg-white/10 rounded"></div>
            {/* จำลองตัวเลขเปอร์เซ็นต์ด้านขวา */}
            <div className="w-8 h-4 bg-white/10 rounded"></div>
          </div>
          {/* จำลองหลอด Progress Bar */}
          <div className="h-1.5 w-full bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}