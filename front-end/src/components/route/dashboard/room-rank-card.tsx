import { PopularRoomResponse } from "@/utils/interface/response"

interface RoomRankCardProps {
  popularRooms: PopularRoomResponse
}

export function RoomRankCard({ popularRooms }: RoomRankCardProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2 group">
        {/* 🌟 ตัวเลขลำดับ (01, 02): สีเทาอ่อน (Light) / ขาวโปร่งแสง (Dark) */}
        <span className="text-3xl font-bold text-gray-400/60 dark:text-white/20 leading-none transition-colors group-hover:text-dark-purple/50">
          {String(popularRooms.roomNumber).padStart(2, '0')}
        </span>
        
        <div className="flex-1 flex flex-col justify-between items-baseline gap-3">
          <div className='flex justify-between w-full'>
            {/* 🌟 ชื่อห้อง: ดำ (Light) / ขาว (Dark) */}
            <span className="font-bold text-light-main dark:text-white">
              {popularRooms.name}
            </span>
            {/* 🌟 เปอร์เซ็นต์: เทา (Light) / เทาอ่อน (Dark) */}
            <span className="text-xs font-bold text-light-secondary dark:text-gray-400">
              {popularRooms.percentage}%
            </span>
          </div>
          
          {/* 🌟 หลอด Progress Track: เทาอ่อน (Light) / ขาวโปร่ง (Dark) */}
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            {/* 🌟 หลอด Progress Fill: ใช้สีม่วงเข้ม (dark-purple) ซึ่งเด่นในทั้งสองโหมด */}
            <div 
              className="h-full bg-dark-purple rounded-full transition-all duration-1000" 
              style={{ width: `${popularRooms.percentage}%` }}
            ></div>
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
        {/* ⏳ จำลองตัวเลขใหญ่ด้านซ้าย: สีเทาอ่อน (Light) / ขาวโปร่ง (Dark) */}
        <div className="w-9 h-8 bg-gray-200 dark:bg-white/10 rounded-md"></div>
        
        <div className="flex-1 flex flex-col justify-between items-baseline gap-3">
          <div className='flex justify-between w-full'>
            {/* ⏳ จำลองชื่อห้อง */}
            <div className="w-32 h-4 bg-gray-200 dark:bg-white/10 rounded"></div>
            {/* ⏳ จำลองตัวเลขเปอร์เซ็นต์ด้านขวา */}
            <div className="w-8 h-4 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
          {/* ⏳ จำลองหลอด Progress Bar */}
          <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}