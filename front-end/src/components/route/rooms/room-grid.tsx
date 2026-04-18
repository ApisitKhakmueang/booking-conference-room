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
      <ul className="grid md:grid-cols-5 grid-cols-2 rounded-4xl overflow-hidden border dark:border-card dark:text-stone-400 border-light-hover text-violet-900">
        {displayRooms.map((room) => {
          const currentStatus = (room?.status || 'available') as RoomStatus;
          const StatusIcon = STATUS_CONFIG[currentStatus].icon;
          
          return (
          <li 
            key={room.id} 
            className="p-5 dark:hover:bg-hover hover:bg-light-sidebar transition-duration-300 cursor-pointer group"
            onClick={() => {
              // 🌟 2. แยกพฤติกรรมการคลิกตามสถานะห้อง
              if (currentStatus === 'occupied') {
                // หา Booking ที่กำลังใช้งานห้องนี้อยู่
                // (สมมติว่าเช็คจาก ID ห้อง และสถานะ confirm)
                const activeBooking = bookings.find(
                  (b) => b.Room.id === room.id && b.status === 'confirm'
                );
                
                if (activeBooking) {
                  setSelectedBooking(activeBooking);
                  setIsOccupyModalOpen(true); // เปิด Modal รายละเอียด
                }
              } 
              else if (currentStatus === 'available') {
                // ถ้าห้องว่าง เปิด Modal จองปกติ
                setSelectedRoomNumber(room.roomNumber);
                setIsAddModalOpen(true);
              }
              else {
                // ถ้าเป็น maintenance อาจจะแจ้งเตือนว่าปิดปรับปรุง
                alert("This room is currently under maintenance.");
              }
            }}
            >
            <h2 className="text-xl font-semibold opacity-80 group-hover:opacity-100">{room.name}</h2>

            <div className='flex justify-center py-8 transition-transform duration-300 group-hover:scale-110'>
              {/* 🌟 4. ดึงสีตาม Status มาใส่ให้ไอคอนตรงกลาง */}
              <StatusIcon size={80} className={STATUS_CONFIG[currentStatus].iconColor} strokeWidth={1.5} />
            </div>

            <div className='flex xl:flex-row flex-col xl:items-center xl:justify-between gap-2 text-xl font-semibold'>
              <p className="flex items-center text-center text-2xl gap-1">
                {room.capacity} 
                <UserRound />
              </p>

              <p className={`${STATUS_CONFIG[currentStatus].textColor} text-lg capitalize transition-duration-300`}>
                {room.status}
              </p>
            </div>
          </li>)
        })}
      </ul>

      <BookingModal 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={(val) => {
          setIsAddModalOpen(val);
          if (!val) setSelectedRoomNumber(null); // เคลียร์ค่าทิ้งตอนปิด Modal
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
  // สมมติให้ตอนโหลดโชว์เป็นกรอบเปล่าๆ 10 ห้อง (หรือแก้ตามจำนวนห้องเฉลี่ยที่คุณมีได้เลย)
  return (
    <ul className="grid md:grid-cols-5 grid-cols-2 rounded-4xl overflow-hidden border dark:border-card border-light-hover">
      {Array.from({ length: 10 }).map((_, index) => (
        <li key={index} className="p-5">
          <div className="animate-pulse flex flex-col h-full">
            
            {/* 🌟 Title Skeleton (ชื่อห้อง) */}
            <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-md"></div>

            {/* 🌟 Center Icon Skeleton (ไอคอนตรงกลาง) */}
            <div className="flex justify-center py-10">
              <div className="w-20 h-20 bg-slate-200 dark:bg-white/10 rounded-2xl"></div>
            </div>

            {/* 🌟 Footer Skeleton (ความจุ และ สถานะ) */}
            <div className="flex xl:flex-row flex-col xl:items-center xl:justify-between gap-2 mt-auto">
              {/* ความจุ (Capacity) */}
              <div className="h-8 w-16 bg-slate-200 dark:bg-white/10 rounded-md"></div>
              {/* สถานะ (Status) */}
              <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-md"></div>
            </div>

          </div>
        </li>
      ))}
    </ul>
  );
}