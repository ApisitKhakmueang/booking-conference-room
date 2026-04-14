import { useEffect, useMemo, useState } from 'react';
import {
  format, startOfWeek, endOfWeek, 
  startOfDay,  eachDayOfInterval,
  isSameDay, differenceInMinutes
} from 'date-fns';
import { Plus } from 'lucide-react';
import BookingModal from '@/components/utils/booking-modal';
import { Button } from '@/components/ui/button';
import { BookingEvent, TimeGridViewProps } from '@/utils/interface/interface';
import { cn } from '@/lib/utils';
import { mapBookingEvents } from '@/lib/map-resp-event';
import { useSystemConfig } from '@/hooks/data/useSystemConfig';

// --- Component: Time Grid View (สำหรับ Week และ Day) ---
export default function TimeGridView({ setCurrentDate, currentDate, bookings, view, holiday, isSyncing, currentUser }: TimeGridViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | undefined>(undefined);
  const [events, setEvents] = useState<BookingEvent[] | undefined>(undefined);
  const { config, isLoadingConfig } = useSystemConfig();

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

  const handleAddClick = () => {
    setTypeOperate('add');
    setSelectedEvent(undefined); 
    setIsAddModalOpen(true);
  };

  const handleEditClick = (event: BookingEvent) => {
    setTypeOperate('update');
    setSelectedEvent(event); 
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    const formattedEvents = mapBookingEvents(bookings || [], config);
    setEvents(formattedEvents);
  }, [bookings]);

  return (
    <div className="flex h-full overflow-hidden flex-col relative bg-white dark:bg-transparent rounded-b-lg">
      {isSyncing && (
        <div className="absolute top-2 right-4 z-10 text-xs text-dark-purple flex items-center gap-1 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full shadow-md border border-gray-100 dark:border-white/10">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}

      {/* 🌟 1. Header: เปลี่ยนพื้นหลังเป็นเทาอ่อนสว่างๆ ขอบสีเทา */}
      <div className={`grid border-b border-gray-200 dark:border-sidebar bg-gray-50 dark:bg-sidebar/70 transition-opacity duration-300 
        ${view === 'day' ? 'grid-cols-1 pl-0' : 'grid-cols-7 pl-16'}
        ${isSyncing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {days.map(day => {
          const holidays = holiday?.filter(e => isSameDay(e.date, day));
          return (
            <div 
             key={day.toString()}
             className={`flex items-center border-r border-gray-200 dark:border-sidebar last:border-0 ${view === 'day' ? 'flex-row' : 'flex-col'}`}>
              
              {/* 🌟 2. ตัวหนังสือวันที่: ปรับสีและรูปแบบป้ายบอกวันปัจจุบัน (Today) */}
              <div className={`py-3 text-center shrink-0 w-16 ${isSameDay(day, new Date()) ? 'text-dark-purple dark:text-white' : 'text-light-secondary dark:text-gray-400'}`}>
                <div className="text-[11px] uppercase font-bold tracking-wider">{format(day, 'EEE')}</div>
                <div className={`text-xl font-light mt-0.5 ${isSameDay(day, new Date()) ? 'bg-dark-purple text-white shadow-md dark:shadow-none font-semibold inline-block w-8 h-8 leading-8 rounded-full' : 'inline-block w-8 h-8 leading-8'}`}>
                    {format(day, 'd')}
                </div>
              </div>
              
              <div className="py-2 text-center border-gray-200 dark:border-sidebar last:border-0 w-full flex flex-col gap-1 items-center justify-center">
                {holidays?.map(evt => (
                  // 🌟 3. Holiday Chip: สีเขียวพาสเทล ให้เข้ากับ MonthView
                  <div key={evt.id} className="text-[10px] font-medium px-2 py-0.5 rounded border-l-2 truncate w-11/12 bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-100 shadow-sm">
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
          
          {/* 🌟 4. Timeline Labels (แกนซ้าย): พื้นหลังสีขาว/เทาอ่อนให้สะอาดตา */}
          <div className="w-16 shrink-0 border-r border-gray-200 dark:border-sidebar bg-white dark:bg-sidebar z-10 sticky left-0">
            {hours.map(h => (
              <div key={h} className="h-15 text-[11px] font-medium text-light-secondary dark:text-gray-500 text-right pr-2 pt-2 relative -top-2">
                {h}:00
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className={`flex-1 grid ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'} divide-x divide-gray-200 dark:divide-sidebar bg-white dark:bg-transparent`}>
            {days.map(day => (
              <div key={day.toString()} className="relative group">
                {/* 🌟 5. เส้น Grid แนวนอน: ปรับให้สีอ่อนลงบางๆ ไม่แย่งซีน */}
                {hours.map(h => (
                  <div key={h} className="h-15 border-b border-gray-100 dark:border-sidebar/40 w-full box-border"></div>
                ))}

                {/* --- Render Events (Absolute Positioning) --- */}
                {events?.filter(e => isSameDay(e.startTime, day)).map(evt => {
                  const startMin = differenceInMinutes(evt.startTime, startOfDay(evt.startTime));
                  const duration = differenceInMinutes(evt.endTime, evt.startTime);
                  
                  // เช็กว่าเป็นของ User ปัจจุบันหรือไม่
                  const isMine = currentUser && evt.user?.id && String(evt.user.id) === String(currentUser.id)

                  return (
                    <div
                      key={evt.id}
                      tabIndex={0} 
                      className="group absolute left-1 right-1 cursor-pointer z-10 hover:z-50 focus:z-50 focus:outline-none"
                      style={{
                        top: `${startMin}px`, 
                        height: `${duration}px`,
                      }}
                    >
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-full min-h-7 overflow-hidden group-hover:min-h-fit group-focus:min-h-fit group-hover:shadow-xl group-focus:shadow-xl rounded px-2 py-1 text-xs border-l-[3px] transition-all duration-200 flex flex-col shadow-sm",
                        // 🌟 6. สีของการจอง: ใช้ Pastel Purple (เรา) และ Pastel Orange (คนอื่น)
                        isMine 
                          ? "bg-purple-100 border-purple-400 text-purple-900 hover:bg-purple-200 dark:bg-purple-900/90 dark:border-purple-500 dark:text-purple-50 dark:hover:bg-purple-800/95" 
                          : "bg-orange-100 border-orange-400 text-orange-900 hover:bg-orange-200 dark:bg-orange-900/90 dark:border-orange-500 dark:text-orange-50 dark:hover:bg-orange-800/95" 
                        )}
                        onClick={() => isMine ? 
                          handleEditClick({
                            ...evt, 
                            startTime: format(evt.startTime, 'HH:mm'), 
                            endTime: format(evt.endTime, 'HH:mm')
                          }) 
                          : undefined
                        }
                      >
                        
                        <div className="font-semibold truncate">
                          {evt.title} {isMine && "(Me)"} 
                        </div>
                        
                        <div className="opacity-80 text-[10px] leading-tight mt-0.5 flex flex-col gap-0.5">
                          <div className="truncate">By: {isMine ? "You" : evt.user?.fullName || "Unknown"}</div>
                          <div className="truncate whitespace-nowrap font-medium">
                            {format(evt.startTime, 'HH:mm')} - {format(evt.endTime, 'HH:mm')}
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  );
                })}

                {/* เส้นบอกเวลาปัจจุบัน (Current Time Indicator) */}
                {isSameDay(day, new Date()) && (
                  <div 
                    className="absolute w-full border-t-2 border-danger dark:border-rose-500 z-10 pointer-events-none"
                    style={{ top: `${differenceInMinutes(new Date(), startOfDay(new Date()))}px` }}
                  >
                    <div className="w-2.5 h-2.5 bg-danger dark:bg-rose-500 rounded-full absolute -left-1.5 -top-1.5 shadow-sm"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 7. FAB (Add Button): เปลี่ยนสีฟ้าหลงฝูงเป็นสีม่วง dark-purple */}
      <Button 
        className='absolute z-60 bg-dark-purple hover:bg-light-hover dark:bg-dark-purple/90 dark:hover:bg-dark-purple bottom-7 right-7 w-14 h-14 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95'
        onClick={handleAddClick}>
        <Plus className='w-8! h-8! text-white stroke-[2.5px]'/>
      </Button>

      <BookingModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} typeOperate={typeOperate} selectedEvent={selectedEvent} setCurrentDate={setCurrentDate} currentDate={currentDate} />
    </div>
  );
}