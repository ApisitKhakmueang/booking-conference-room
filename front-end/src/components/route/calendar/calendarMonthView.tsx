import { useCallback, useMemo } from 'react';
import {
  format, addDays,
  startOfWeek, endOfWeek,  eachDayOfInterval,
  isSameDay, isSameMonth, startOfMonth, endOfMonth, setHours, setMinutes,
  startOfDay,
  endOfDay
} from 'date-fns';
import { Holiday, BookingEventResponse } from '@/utils/interface/response';
import { MonthProps } from '@/utils/interface/interface';
import { cn } from '@/lib/utils';

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
export default function MonthView({ currentDate, bookings, holiday, isSyncing, setView, setCurrentDate, currentUser }: MonthProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const groupedEvents = useMemo(() => {
    const map = new Map<string, BookingEventResponse[]>();
    
    if (bookings) {
      bookings.forEach(evt => {
        try {
          // 1. หา "ทุกวัน" ที่ Event นี้ครอบคลุม (ตั้งแต่ start ถึง end)
          // ใส่ startOfDay และ endOfDay เพื่อป้องกันบั๊กเรื่องเวลาเศษชั่วโมงข้ามวัน
          const daysInvolved = eachDayOfInterval({
            start: startOfDay(evt.startTime),
            end: endOfDay(evt.endTime)
          });

          // 2. วนลูปเอา Event นี้ไปใส่ในทุกๆ วันที่มันครอบคลุม
          daysInvolved.forEach(dateObj => {
            const dateKey = format(dateObj, 'yyyy-MM-dd');
            
            if (!map.has(dateKey)) {
              map.set(dateKey, []);
            }
            map.get(dateKey)!.push(evt);
          });

        } catch (error) {
          // Fallback: เผื่อกรณีข้อมูล startTime/endTime ผิดพลาด (เช่น end มาก่อน start)
          // ให้ยัดใส่วันเริ่มต้นแค่วันเดียวไปก่อน
          const dateKey = format(evt.startTime, 'yyyy-MM-dd');
          if (!map.has(dateKey)) map.set(dateKey, []);
          map.get(dateKey)!.push(evt);
        }
      });
    }

    // console.log("groupedEvents: ", map)
    return map;
  }, [bookings]);

  const groupedHolidays = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    if (holiday) {
      holiday.forEach(evt => {
        // ถ้าระบบวันหยุดมีแค่ evt.date (วันเดียว) ก็ใช้แบบเดิมได้เลย
        // แต่ถ้ามี evt.startDate และ evt.endDate ให้ใช้ eachDayOfInterval เหมือน BookingEventResponse ครับ
        const dateKey = format(evt.date, 'yyyy-MM-dd'); 
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(evt);
      });
    }
    return map;
  }, [holiday]);

  const handleClickDay = useCallback((date: Date) => {
    setCurrentDate(date)
    setView('day')
  }, [])

  return (
    <div className="h-full flex flex-col">
      {isSyncing && (
        <div className="absolute top-2 right-4 z-10 text-xs text-blue-500 flex items-center gap-1 bg-white/80 dark:bg-black/80 px-2 py-1 rounded-full shadow">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}

       {/* Week Header */}
       <div className="grid grid-cols-7 border-b dark:border-sidebar border-white">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-sm dark:text-gray-400 text-white border-r dark:border-sidebar dark:bg-sidebar/70 bg-light-hover/80 last:border-0">{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className={`grid grid-cols-7 flex-1 auto-rows-fr transition-opacity duration-300 ${isSyncing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {days.map((day) => {
           const isToday = isSameDay(day, new Date());
           const dateKey = format(day, 'yyyy-MM-dd');
           
           // 1. ดึงข้อมูลวันหยุดและการจองของวันนี้ออกมา
           const todaysHolidays = groupedHolidays?.get(dateKey) || [];
           const todaysEvents = groupedEvents?.get(dateKey) || [];
           
           // 2. จับมารวมกัน (เอากลุ่มวันหยุดขึ้นก่อน) แล้วนับจำนวนทั้งหมด
           const allItems = [...todaysHolidays, ...todaysEvents];
           const totalItems = allItems.length;

           // 3. หั่นเอามาแค่ 3 อันแรกเพื่อแสดงผล
           const MAX_VISIBLE = 2;
           const visibleItems = allItems.slice(0, MAX_VISIBLE);
           const hiddenCount = totalItems - MAX_VISIBLE;

           return (
            <div 
              key={day.toString()} 
              className={`border-b dark:border-hover border-light-hover p-2 min-h-25 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5
                ${day.getDay() !== 6 ? 'border-r' : ''}
                ${!isSameMonth(day, currentDate) 
                  ? 'dark:bg-[#181818] bg-light-sidebar text-gray-600' 
                  : 'dark:text-white text-violet-900'}`}
              onClick={() => handleClickDay(day)}
              >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${isToday ? 'bg-blue-600 dark:bg-dark-purple text-white' : ''}`}>
                {format(day, 'd')}
              </div>
              
              {/* 🌟 แสดงเฉพาะ Item ที่ถูกหั่นมาแล้ว (สูงสุด 3 อัน) */}
              <div className="space-y-1">
                {visibleItems.map((item: any, index: number) => {
                  
                  // เช็กว่านี่คือ Holiday หรือ BookingEventResponse (Holiday จะมี name, Booking จะมี title)
                  const isHoliday = 'name' in item;
                  
                  if (isHoliday) {
                    return (
                      <div key={`hol-${item.id || index}`} className="text-xs px-1.5 py-0.5 rounded border-l-2 truncate dark:bg-green-900/60 dark:border-green-500 bg-green-200 border-green-300 text-green-900 dark:text-green-100 shadow-sm">
                        {item.name}
                      </div>
                    )
                  } else {
                    const isMine = currentUser && item.User.id === currentUser.id;

                    return (
                      <div 
                        key={`evt-${item.id || index}`} 
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded border-l-2 truncate shadow-sm",
                          isMine
                            ? "dark:bg-blue-900/60 dark:border-blue-500 bg-blue-200 border-blue-300 text-blue-900 dark:text-blue-100" // สีน้ำเงิน
                            : "dark:bg-orange-900/60 dark:border-orange-500 bg-orange-200 border-orange-300 text-orange-900 dark:text-orange-100" // สีส้ม
                        )}
                      >
                        {item.title}
                      </div>
                    )
                  }
                })}

                {/* 🌟 ถ้ามีมากกว่า 3 อัน ให้แสดงปุ่ม +X More */}
                {hiddenCount > 0 && (
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-1">
                    ... +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}