'use client'

import { MonitorCheck, MonitorX, ToolCase, UserRound } from 'lucide-react';
import { BookingEventResponse, RoomResponse } from '@/utils/interface/response';
import BookingModal from '@/components/utils/booking-modal';
import { useState } from 'react';
import OccupyModal from './occupy-modal';

type RoomStatus = "available" | "occupied" | "maintenance";

const STATUS_CONFIG: Record<
  RoomStatus,
  { icon: React.ElementType, textColor: string, iconColor: string }
> = {
  // ... (ส่วน STATUS_CONFIG คงเดิม) ...
  available: { 
    icon: MonitorCheck, 
    textColor: "text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-500 dark:text-emerald-400"
  },
  occupied: { 
    icon: MonitorX, 
    textColor: "text-rose-600 dark:text-rose-400",
    iconColor: "text-rose-500 dark:text-rose-400"
  },
  maintenance: { 
    icon: ToolCase, 
    textColor: "text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-500 dark:text-amber-400"
  },
};

export default function RoomsGrid({ displayRooms, bookings }: { displayRooms: RoomResponse[], bookings: BookingEventResponse[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number | null>(null)

  const [isOccupyModalOpen, setIsOccupyModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingEventResponse | null>(null)

  return (
    <>
      {/* 🌟 1. ลบ border/overflow ที่ ul ออก และใส่ gap เข้าไปแทน ปรับคอลัมน์ให้ยืดหยุ่นตามขนาดจอ */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 text-violet-900 dark:text-stone-400">
        {displayRooms.map((room) => {
          const currentStatus = (room?.status || 'available') as RoomStatus;
          const StatusIcon = STATUS_CONFIG[currentStatus].icon;
          
          return (
          <li 
            key={room.id} 
            // 🌟 2. เปลี่ยนแต่ละห้องให้กลายเป็นการ์ด (มีพื้นหลัง, มีกรอบ, มุมโค้ง)
            className="bg-transparent border border-gray-200 dark:border-white/5 rounded-3xl p-5 md:p-6 hover:border-dark-purple/50 dark:hover:border-white/5 dark:hover:bg-hover hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px]"
            onClick={() => {
              if (currentStatus === 'occupied') {
                const activeBooking = bookings.find(
                  (b) => b.Room.id === room.id && b.status === 'confirm'
                );
                if (activeBooking) {
                  setSelectedBooking(activeBooking);
                  setIsOccupyModalOpen(true);
                }
              } 
              else if (currentStatus === 'available') {
                setSelectedRoomNumber(room.roomNumber);
                setIsAddModalOpen(true);
              }
              else {
                alert("This room is currently under maintenance.");
              }
            }}
            >
            <h2 className="text-lg md:text-xl font-bold opacity-80 group-hover:opacity-100 transition-opacity">{room.name}</h2>

            <div className='flex justify-center py-6 transition-transform duration-300 group-hover:scale-110 flex-1 items-center'>
              <StatusIcon size={64} className={`md:w-20 md:h-20 ${STATUS_CONFIG[currentStatus].iconColor}`} strokeWidth={1.5} />
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-lg md:text-xl font-semibold mt-auto'>
              <p className="flex items-center gap-1.5 text-light-secondary dark:text-secondary">
                {room.capacity} 
                <UserRound size={18} />
              </p>

              <p className={`${STATUS_CONFIG[currentStatus].textColor} text-sm md:text-lg capitalize font-bold`}>
                {room.status}
              </p>
            </div>
          </li>)
        })}
      </ul>

      {/* ... (Modal วางไว้เหมือนเดิม) ... */}
      <BookingModal 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={(val) => {
          setIsAddModalOpen(val);
          if (!val) setSelectedRoomNumber(null);
        }} 
        typeOperate='add' 
        setCurrentDate={setCurrentDate} 
        currentDate={currentDate} 
        preselectedRoomNumber={selectedRoomNumber}
        />

      {isOccupyModalOpen && selectedBooking && (
        <OccupyModal setIsOccupyModalOpen={setIsOccupyModalOpen} selectedBooking={selectedBooking} />
      )}
    </>
  )
}

export function RoomGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
      {Array.from({ length: 10 }).map((_, index) => (
        // 🌟 3. อัปเดต Skeleton ให้หน้าตาเหมือนโครงสร้างการ์ดใหม่
        <li key={index} className="bg-transparent dark:bg-card border border-gray-200 dark:border-white/5 rounded-3xl p-5 md:p-6 min-h-[220px]">
          <div className="animate-pulse flex flex-col h-full">
            <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-md"></div>

            <div className="flex justify-center py-6 flex-1 items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 dark:bg-white/10 rounded-2xl"></div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-auto">
              <div className="h-6 w-12 bg-slate-200 dark:bg-white/10 rounded-md"></div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-md"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}