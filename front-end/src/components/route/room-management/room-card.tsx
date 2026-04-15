import { X, MapPin } from 'lucide-react';
import { RoomCardProps } from '@/utils/interface/interface';

export default function RoomCard({ room, onDelete }: RoomCardProps) {
  const isMaintenance = room.isActive === 'maintenance';
  
  const statusStyle = isMaintenance
    ? { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger shadow-[0_0_8px_var(--color-danger)]' }
    : { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success shadow-[0_0_8px_var(--color-success)]' };

  return (
    // 🌟 เปลี่ยน flex-row เป็น flex-col บนมือถือ และตั้ง relative เพื่อให้ปุ่ม X แปะมุมบนขวาได้
    <div className="relative flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 bg-white border border-gray-100 hover:bg-light-purple shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 group rounded-2xl cursor-pointer gap-4 md:gap-0">
      
      {/* 1. Name & Location */}
      <div className="flex flex-col gap-1.5 w-full md:w-1/3 pr-8 md:pr-0">
        <h3 className="text-light-main dark:text-main font-bold text-lg tracking-wide">
          {room.name}
        </h3>
        <div className="flex items-center gap-1.5 text-light-secondary dark:text-secondary text-xs uppercase tracking-widest font-medium">
          <MapPin className="w-3 h-3" />
          <span>{room.location}</span>
          <span className="opacity-50">•</span>
          <span>NO. {room.roomNumber.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* 🌟 จับ Capacity และ Status มัดรวมกันในมือถือ เพื่อให้เรียงสวยๆ */}
      <div className="flex items-center justify-between w-full md:w-1/2 border-t border-gray-100 dark:border-white/5 md:border-none pt-3 md:pt-0">
        
        {/* 2. Capacity */}
        <div className="flex items-center gap-2 md:w-1/2">
          <span className="text-light-main dark:text-main font-bold text-base">
            {room.capacity.toString().padStart(2, '0')}
          </span>
          <span className="text-light-secondary dark:text-secondary text-xs font-bold tracking-widest uppercase">
            PAX
          </span>
        </div>

        {/* 3. Status Badge */}
        <div className="flex md:w-1/2 md:justify-start justify-end">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${statusStyle.text}`}>
              {room.isActive}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action (Delete Button) */}
      {/* 🌟 ในมือถือจะเป็น Absolute แปะมุมขวาบน จอใหญ่จะกลับมาอยู่ Flex ขวาสุด */}
      <div className="absolute top-3 right-3 md:relative md:top-auto md:right-auto flex justify-end md:w-12">
        <button 
          onClick={(e) => {
             e.stopPropagation(); 
             onDelete(room.id);
          }}
          className="text-light-secondary dark:text-secondary bg-transparent hover:bg-danger/10 dark:hover:bg-hover hover:text-danger dark:hover:text-white transition-colors p-2 rounded-lg cursor-pointer"
          title="Delete Room"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}