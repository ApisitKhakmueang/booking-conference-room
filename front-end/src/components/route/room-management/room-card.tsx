import { X, MapPin } from 'lucide-react';
import { RoomCardProps } from '@/utils/interface/interface';
import Swal from 'sweetalert2';
import { roomService } from '@/service/booking.service';

export default function RoomCard({ room, onDelete }: RoomCardProps) {
  const isMaintenance = room.status === 'maintenance';
  
  const statusStyle = isMaintenance
    ? { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger shadow-[0_0_8px_var(--color-danger)]' }
    : { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success shadow-[0_0_8px_var(--color-success)]' };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // สำคัญมาก! ป้องกันไม่ให้การคลิกทะลุไปเปิด Modal แก้ไข

    // ถามเพื่อความแน่ใจก่อนลบ
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this room?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#8370ff',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        const result = await roomService.deleteRoom(room.id);
        
        // 🌟 1. เปลี่ยนจาก === 200 เป็นเงื่อนไขที่ครอบคลุมความสำเร็จทั้งหมด (200-299)
        // เพราะบาง API สั่ง Delete สำเร็จจะตอบ 204 No Content
        if (result.status >= 200 && result.status < 300) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your room has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          // 🌟 2. เพิ่ม setTimeout หน่วงเวลาสักนิด (เช่น 300ms) 
          // เพื่อให้ชัวร์ว่า Database ฝั่ง Backend ลบข้อมูลเสร็จแล้วจริงๆ ก่อนที่เราจะขอข้อมูลใหม่
          if (onDelete) {
            setTimeout(() => {
              onDelete();
            }, 100); // 0.3 วินาที (เร็วพอที่ผู้ใช้จะไม่รู้สึกว่าช้า แต่มากพอให้ DB ลบเสร็จ)
          }
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete booking', 'error');
      }
    }
  };

  return (
    // 🌟 เปลี่ยน flex-row เป็น flex-col บนมือถือ และตั้ง relative เพื่อให้ปุ่ม X แปะมุมบนขวาได้
    <div 
      className="relative flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 bg-white border border-gray-100 hover:bg-light-purple shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 group rounded-2xl cursor-pointer gap-4 md:gap-0">
      
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
              {room.status}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action (Delete Button) */}
      {/* 🌟 ในมือถือจะเป็น Absolute แปะมุมขวาบน จอใหญ่จะกลับมาอยู่ Flex ขวาสุด */}
      <div className="absolute top-3 right-3 md:relative md:top-auto md:right-auto flex justify-end md:w-12">
        <button 
          onClick={handleDelete}
          className="text-light-secondary dark:text-secondary bg-transparent hover:bg-danger/10 dark:hover:bg-hover hover:text-danger dark:hover:text-white transition-colors p-2 rounded-lg cursor-pointer"
          title="Delete Room"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div 
          key={index}
          className="relative flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 bg-white border border-gray-100 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar rounded-2xl gap-4 md:gap-0 animate-pulse"
        >
          {/* 1. Name & Location */}
          <div className="flex flex-col gap-2 w-full md:w-1/3 pr-8 md:pr-0 mt-1">
            <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-md"></div>
            <div className="h-3 w-48 bg-slate-200 dark:bg-white/10 rounded-md"></div>
          </div>

          {/* Capacity & Status */}
          <div className="flex items-center justify-between w-full md:w-1/2 border-t border-gray-100 dark:border-white/5 md:border-none pt-3 md:pt-0 mt-1">
            {/* Capacity */}
            <div className="flex items-center gap-2 md:w-1/2">
              <div className="h-5 w-8 bg-slate-200 dark:bg-white/10 rounded-md"></div>
              <div className="h-3 w-8 bg-slate-200 dark:bg-white/10 rounded-md"></div>
            </div>

            {/* Status Badge */}
            <div className="flex md:w-1/2 md:justify-start justify-end">
              <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-full"></div>
            </div>
          </div>

          {/* Action */}
          <div className="absolute top-3 right-3 md:relative md:top-auto md:right-auto flex justify-end md:w-12">
            <div className="h-8 w-8 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
          </div>
        </div>
      ))}
    </>
  );
}