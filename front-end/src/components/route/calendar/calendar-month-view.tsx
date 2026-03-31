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
    <div className="h-full flex flex-col bg-white dark:bg-transparent rounded-b-lg">
      {isSyncing && (
        <div className="absolute top-2 right-4 z-10 text-xs text-dark-purple flex items-center gap-1 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full shadow-md border border-gray-100 dark:border-white/10">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}

       {/* 🌟 1. Week Header: เปลี่ยนพื้นหลังเป็นสีเทาอ่อนสว่างๆ ตัวหนังสือสีเทาเข้ม */}
       <div className="grid grid-cols-7 border-b border-gray-200 dark:border-sidebar bg-gray-50 dark:bg-sidebar/70">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2.5 text-center text-sm font-semibold text-light-secondary dark:text-gray-400 border-r border-gray-200 dark:border-sidebar last:border-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-7 flex-1 auto-rows-fr transition-opacity duration-300 ${isSyncing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {days.map((day) => {
           const isToday = isSameDay(day, new Date());
           const dateKey = format(day, 'yyyy-MM-dd');
           
           const todaysHolidays = groupedHolidays?.get(dateKey) || [];
           const todaysEvents = groupedEvents?.get(dateKey) || [];
           
           const allItems = [...todaysHolidays, ...todaysEvents];
           const totalItems = allItems.length;

           const MAX_VISIBLE = 2;
           const visibleItems = allItems.slice(0, MAX_VISIBLE);
           const hiddenCount = totalItems - MAX_VISIBLE;

           return (
            <div 
              key={day.toString()} 
              // 🌟 2. Grid Cell: ใช้เส้นขอบสีเทาอ่อน (gray-200) แทนสีม่วง และปรับ hover ให้ซอฟต์ลง
              className={`border-b border-gray-200 dark:border-hover p-2 min-h-25 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                ${day.getDay() !== 6 ? 'border-r border-gray-200 dark:border-hover' : ''}
                ${!isSameMonth(day, currentDate) 
                  ? 'bg-gray-50/50 dark:bg-[#181818] text-gray-400 dark:text-gray-600' // วันที่อยู่นอกเดือน
                  : 'text-gray-800 dark:text-white'}`} // วันที่อยู่ในเดือน
              onClick={() => handleClickDay(day)}
              >
              
              {/* 🌟 3. Today Indicator: เปลี่ยนสีน้ำเงินเป็นสีม่วง dark-purple ให้เข้าธีม */}
              <div className="flex justify-end mb-1">
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                  ${isToday ? 'bg-dark-purple text-white shadow-md dark:shadow-none' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="space-y-1.5">
                {visibleItems.map((item: any, index: number) => {
                  
                  const isHoliday = 'name' in item;
                  
                  if (isHoliday) {
                    return (
                      // 🌟 4. Holiday Chip: สีเขียวพาสเทล
                      <div key={`hol-${item.id || index}`} className="text-[11px] px-2 py-0.5 rounded border-l-2 truncate dark:bg-emerald-900/40 dark:border-emerald-500 bg-emerald-100 border-emerald-300 text-emerald-800 dark:text-emerald-100 font-medium">
                        {item.name}
                      </div>
                    )
                  } else {
                    const isMine = currentUser && item.User?.id && String(item.User.id) === String(currentUser.id)

                    return (
                      <div 
                        key={`evt-${item.id || index}`} 
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded border-l-2 truncate font-medium",
                          isMine
                            // 🌟 5. My Booking: ใช้สีม่วงของแบรนด์ (แทนสีน้ำเงินเดิม)
                            ? "dark:bg-purple-900/40 dark:border-purple-500 bg-purple-100 border-purple-300 text-purple-800 dark:text-purple-100" 
                            // 🌟 6. Other Booking: ใช้สีส้มพาสเทลให้ดูไม่ก้าวร้าว
                            : "dark:bg-orange-900/40 dark:border-orange-500 bg-orange-100 border-orange-300 text-orange-800 dark:text-orange-100" 
                        )}
                      >
                        {item.title}
                      </div>
                    )
                  }
                })}

                {hiddenCount > 0 && (
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 pl-1 mt-1">
                    +{hiddenCount} more
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