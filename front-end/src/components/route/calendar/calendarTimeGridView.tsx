import { useMemo } from 'react';
import {
  format, addDays,
  startOfWeek, endOfWeek, startOfDay,  eachDayOfInterval,
  isSameDay, differenceInMinutes, setHours, setMinutes
} from 'date-fns';
import { Holiday } from '@/lib/interface/response';

const TODAY = new Date(); 
const EVENTS = [
  { 
    id: 1, 
    title: 'Marketing Sync', 
    start: setMinutes(setHours(TODAY, 9), 0), // วันนี้ 09:00
    end: setMinutes(setHours(TODAY, 10), 30), // ถึง 10:30
    color: 'bg-purple-900/60 border-purple-500 text-purple-100' 
  },
  { 
    id: 2, 
    title: 'Client Meeting', 
    start: setMinutes(setHours(addDays(TODAY, 1), 13), 0), // พรุ่งนี้ 13:00
    end: setMinutes(setHours(addDays(TODAY, 1), 14), 0),   // ถึง 14:00
    color: 'bg-blue-900/60 border-blue-500 text-blue-100' 
  },
    { 
    id: 3, 
    title: 'Lunch', 
    start: setMinutes(setHours(TODAY, 12), 0), // วันนี้ 12:00
    end: setMinutes(setHours(TODAY, 13), 0),   // ถึง 13:00
    color: 'bg-orange-900/60 border-orange-500 text-orange-100' 
  },
];

// --- Component: Time Grid View (สำหรับ Week และ Day) ---
export default function TimeGridView({ currentDate, view, holiday }: { currentDate: Date, view: 'week' | 'day', holiday: Holiday[] | null }) {
  // 1. สร้าง Columns (ถ้า Week = 7 วัน, ถ้า Day = 1 วัน)
  const days = useMemo(() => {
    if (view === 'day') return [currentDate];
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  // 2. สร้างเส้นเวลา (00:00 - 23:00)
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  return (
    <div className="flex h-full overflow-hidden flex-col">
      {/* Header (แสดงวันที่ด้านบน) */}
      <div className={`grid border-b dark:border-sidebar dark:bg-sidebar bg-light-hover ${view === 'day' ? 'grid-cols-1 pl-0' : 'grid-cols-7 pl-16'}`}>
        {days.map(day => {
          const holidays = holiday?.filter(e => isSameDay(e.date, day));
          return (
            <div 
             key={day.toString()}
             className={`flex items-center border-r dark:border-sidebar border-white last:border-0 ${view === 'day' ? 'flex-row' : 'flex-col'}`}>
              <div className={`py-3 text-center shrink-0 w-16 ${isSameDay(day, new Date()) ? 'dark:text-blue-500 text-violet-900' : 'dark:text-gray-400'}`}>
                <div className="text-xs uppercase font-bold">{format(day, 'EEE')}</div>
                <div className={`text-xl font-light ${isSameDay(day, new Date()) ? 'dark:bg-blue-600/20 bg-violet-900/20 font-semibold inline-block px-2 rounded-full' : ''}`}>
                    {format(day, 'd')}
                </div>
              </div>
              <div className="py-3 text-center border-r dark:border-sidebar last:border-0 dark:text-gray-400 w-full">
                {holidays?.map(evt => (
                  <div key={evt.id} className={`text-xs px-1.5 py-0.5 rounded border-l-2 truncate dark:bg-green-900/60 bg-green-500 border-green-500 text-orange-100 mx-1`}>
                    {evt.name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="flex relative min-h-360"> {/* 1440px = 60px per hour height */}
          
          {/* Timeline Labels (แกนซ้าย) */}
          <div className="w-16 shrink-0 border-r dark:border-sidebar dark:bg-sidebar bg-light-hover z-10 sticky left-0">
            {hours.map(h => (
              <div key={h} className="h-15 text-xs dark:text-gray-500 text-right pr-2 pt-2 relative -top-2">
                {h}:00
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className={`flex-1 grid ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'} divide-x dark:divide-sidebar divide-light-hover`}>
            {days.map(day => (
              <div key={day.toString()} className="relative group">
                {/* เส้น Grid แนวนอน (Hour lines) */}
                {hours.map(h => (
                  <div key={h} className="h-15 border-b dark:border-sidebar/30 border-light-hover/30 w-full box-border"></div>
                ))}

                {/* --- Render Events (Absolute Positioning) --- */}
                {EVENTS.filter(e => isSameDay(e.start, day)).map(evt => {
                  // คำนวณตำแหน่ง
                  const startMin = differenceInMinutes(evt.start, startOfDay(evt.start));
                  const duration = differenceInMinutes(evt.end, evt.start);
                  
                  return (
                    <div
                      key={evt.id}
                      className={`absolute left-1 right-1 rounded px-2 py-1 text-xs border-l-[3px] overflow-hidden cursor-pointer hover:brightness-110 hover:z-20 transition-all shadow-sm ${evt.color}`}
                      style={{
                        top: `${(startMin / 60) * 60}px`, // 60px คือความสูงต่อ 1 ชม.
                        height: `${(duration / 60) * 60}px`
                      }}
                      onClick={() => alert(evt.title)}
                    >
                      <div className="font-semibold">{evt.title}</div>
                      <div className="opacity-75 text-[10px]">
                        {format(evt.start, 'HH:mm')} - {format(evt.end, 'HH:mm')}
                      </div>
                    </div>
                  );
                })}

                {/* เส้นบอกเวลาปัจจุบัน (Current Time Indicator) */}
                {isSameDay(day, new Date()) && (
                  <div 
                    className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none"
                    style={{ top: `${(differenceInMinutes(new Date(), startOfDay(new Date())) / 60) * 60}px` }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full absolute -left-1 -top-1"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}