'use client'

import { MonitorCheck, MonitorX, ToolCase, UserRound } from 'lucide-react';
import { RoomResp } from '@/utils/interface/response';

const MOCK_ROOMS = [
  { id: 1, name: "Room A", capacity: 10, status: "available" },
  { id: 2, name: "Room B", capacity: 10, status: "occupied" },
  { id: 3, name: "Room C", capacity: 10, status: "available" },
  { id: 4, name: "Room D", capacity: 6, status: "maintenance" },
  { id: 5, name: "Room E", capacity: 6, status: "available" },
  { id: 6, name: "Room F", capacity: 6, status: "occupied" },
  { id: 7, name: "Room G", capacity: 6, status: "available" },
  { id: 8, name: "Room H", capacity: 4, status: "available" },
  { id: 9, name: "Room I", capacity: 4, status: "occupied" },
  { id: 10, name: "Room J", capacity: 4, status: "available" },
] as const 

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

export default function RoomsGrid({ displayRooms }: { displayRooms: RoomResp[] }) {
  return (
    <>
      <ul className="grid md:grid-cols-5 grid-cols-2 rounded-4xl overflow-hidden border dark:border-card dark:text-secondary border-light-hover text-violet-900">
        {displayRooms.map((room) => {
          const currentStatus = (room?.status || 'available') as RoomStatus;
          const StatusIcon = STATUS_CONFIG[currentStatus].icon;
          
          return (<li key={room.id} className="p-5 dark:hover:bg-hover hover:bg-light-sidebar transition-duration-300 cursor-pointer group">
            <h2 className="text-xl font-semibold opacity-80 group-hover:opacity-100">{room.name}</h2>

            <div className='flex justify-center py-10 transition-transform duration-300 group-hover:scale-110'>
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
    </>
  )
}