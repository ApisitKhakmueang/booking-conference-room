import { MonitorCheck, MonitorX, ToolCase, UserRound } from 'lucide-react';

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
  React.ElementType
> = {
  available: MonitorCheck,
  occupied: MonitorX,
  maintenance: ToolCase,
};

export default function RoomsGrid() {
  return (
    <ul className="grid grid-cols-5 rounded-4xl overflow-hidden border border-dark-purple bg-light-purple text-violet-900">
      {MOCK_ROOMS.map((room) => {
        const StatusIcon = STATUS_CONFIG[room.status];
        
        return (<li key={room.id} className="p-7 hover:bg-dark-purple hover:text-white transition-duration-300 cursor-pointer group/icons">
          <h2 className="text-xl font-semibold">{room.name}</h2>

          <div className='flex justify-center py-10'>
            <StatusIcon size={100} />
          </div>

          <div className='flex xl:flex-row flex-col xl:items-center xl:justify-between gap-2 text-xl font-semibold'>
            <p className="flex items-center text-center text-2xl gap-1">
              {room.capacity} 
              <UserRound></UserRound>
            </p>

            <p className="text-lg capitalize">
              {room.status}
            </p>
          </div>
        </li>)
      })}
    </ul>
  )
}