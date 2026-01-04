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
  { icon: React.ElementType, textColor: string }
> = {
  available: { icon: MonitorCheck, textColor: "text-green-400 dark:text-success" },
  occupied: { icon: MonitorX, textColor: "text-red-400 dark:text-danger" },
  maintenance: { icon: ToolCase, textColor: "text-yellow-400 dark:text-warning" },
};

export default function RoomsGrid() {
  return (
    <>
      <ul className="grid md:grid-cols-5 grid-cols-2 rounded-4xl overflow-hidden border dark:border-card dark:text-secondary border-dark-purple text-violet-900">
        {MOCK_ROOMS.map((room) => {
          const StatusIcon = STATUS_CONFIG[room.status].icon;
          
          return (<li key={room.id} className="p-7 dark:hover:bg-hover hover:bg-dark-purple hover:text-white transition-duration-300 cursor-pointer group/icons">
            <h2 className="text-xl font-semibold">{room.name}</h2>

            <div className='flex justify-center py-10'>
              <StatusIcon size={80} />
            </div>

            <div className='flex xl:flex-row flex-col xl:items-center xl:justify-between gap-2 text-xl font-semibold'>
              <p className="flex items-center text-center text-2xl gap-1">
                {room.capacity} 
                <UserRound></UserRound>
              </p>

              <p className={`${STATUS_CONFIG[room.status].textColor} text-lg capitalize group-hover/icons:text-white transition-duration-300`}>
                {room.status}
              </p>
            </div>
          </li>)
        })}
      </ul>
    </>
  )
}