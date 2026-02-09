import { useMemo } from 'react';
import {
  format, addDays,
  startOfWeek, endOfWeek,  eachDayOfInterval,
  isSameDay, isSameMonth, startOfMonth, endOfMonth, setHours, setMinutes
} from 'date-fns';
import { Holiday, BookingEvent } from '@/lib/interface/response';

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

// --- Component: Month View (แบบเดิม) ---
export default function MonthView({ currentDate, events, holiday }: { currentDate: Date, events: BookingEvent[] | null, holiday: Holiday[] | null }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="h-full flex flex-col">
       {/* Week Header */}
       <div className="grid grid-cols-7 border-b dark:border-sidebar border-white">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-sm dark:text-gray-400 text-white border-r dark:border-sidebar dark:bg-sidebar bg-light-hover last:border-0">{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
           const isToday = isSameDay(day, new Date());
           const holidays = holiday?.filter(e => isSameDay(e.date, day));
           return (
            <div key={day.toString()} className={`border-b dark:border-hover border-light-hover p-2 min-h-25 
            ${day.getDay() !== 6 ? 'border-r' : ''}
            ${!isSameMonth(day, currentDate) 
              ? 'dark:bg-[#181818] bg-light-sidebar text-gray-600' 
              : 'dark:text-white text-violet-900'}`}>
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {holidays?.map(evt => (
                  <div key={evt.id} className={`text-xs px-1.5 py-0.5 rounded border-l-2 truncate dark:bg-green-900/60 bg-green-500 border-green-500 text-orange-100`}>
                    {evt.name}
                  </div>
                ))}

                {events?.filter(e => isSameDay(e.startTime, day)).map(evt => (
                  <div key={evt.id} className={`text-xs px-1.5 py-0.5 rounded border-l-2 truncate dark:bg-orange-900/60 bg-orange-500 border-orange-500 text-orange-100`}>
                    {evt.title}
                  </div>
                ))}
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}