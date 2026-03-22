export interface BookingEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  host: string;
  status: 'Confirmed' | 'Pending';
  duration: number; // นาที
}

export const mockEvents: BookingEvent[] = [
  {
    id: "1",
    title: "Executive Board Meeting",
    description: "Quarterly performance review and strategic planning.",
    startTime: "09:00",
    endTime: "10:30",
    room: "Conference A",
    host: "James Sterling",
    status: "Confirmed",
    duration: 90,
  },
  {
    id: "2",
    title: "VIP Private Luncheon",
    description: "Host: Sarah Jenkins. Custom catering requirements attached.",
    startTime: "11:30",
    endTime: "13:00",
    room: "Suite 402",
    host: "Elena Rossi",
    status: "Confirmed",
    duration: 90,
  },
  {
    id: "3",
    title: "Product Strategy Sync",
    description: "Informal networking session for local entrepreneurs.",
    startTime: "14:30",
    endTime: "15:30",
    room: "Lab 402",
    host: "Marcus Chen",
    status: "Pending",
    duration: 60,
  }
];

export default function EventCard({ event }: { event: BookingEvent }) {
  const isConfirmed = event.status === "Confirmed";

  return (
    <div className="flex flex-col md:flex-row w-full rounded-xl p-5 mb-4 
      bg-light-sidebar dark:bg-sidebar 
      border border-light-google dark:border-hover
      shadow-sm transition-all hover:shadow-md"
    >
      {/* เวลา (ซ้ายมือใน Desktop, บนสุดใน Mobile) */}
      <div className="flex md:flex-col items-center md:items-start md:w-32 mb-3 md:mb-0 gap-2 md:gap-0">
        <span className="text-lg font-bold text-light-main dark:text-main">
          {event.startTime}
        </span>
        <span className="text-sm text-light-secondary dark:text-secondary hidden md:block">
          AM {/* ปรับ Logic AM/PM ตามจริง */}
        </span>
        {/* Mobile Status Badge */}
        <div className="md:hidden ml-auto">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* รายละเอียด */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs px-2 py-1 rounded-full bg-light-purple dark:bg-card text-dark-purple font-medium">
            {event.room}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold mb-1 text-light-main dark:text-main">
          {event.title}
        </h3>
        
        <p className="text-sm mb-4 text-light-secondary dark:text-secondary">
          {event.description}
        </p>

        {/* Footer ของ Card */}
        <div className="flex items-center gap-4 text-sm text-light-secondary dark:text-secondary">
          <div className="hidden md:block">
            <StatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] text-white">
               {event.host.charAt(0)}
            </span>
            <span>{event.host}</span>
          </div>
          <div className="flex items-center gap-1">
            ⏱ {event.duration} min
          </div>
        </div>
      </div>
    </div>
  );
}

// Component เล็กๆ สำหรับป้ายสถานะ
function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === "Confirmed";
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-white dark:bg-[#1A1A1A]">
      <span className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-success' : 'bg-warning'}`}></span>
      <span className={isConfirmed ? 'text-success' : 'text-warning'}>
        {status}
      </span>
    </div>
  );
}