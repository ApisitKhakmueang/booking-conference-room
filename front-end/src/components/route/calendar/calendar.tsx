'use client'

import { useState, useMemo, useEffect } from 'react';
import { useResponsive } from '@/hooks/ui/useMediaQuery';
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfWeek, endOfWeek, startOfDay,  eachDayOfInterval,
  isSameDay, isSameMonth, startOfMonth, endOfMonth, differenceInMinutes, setHours, setMinutes
} from 'date-fns';
import { cn } from '@/lib/utils';

// --- 1. Types & Mock Data ---
type ViewType = 'month' | 'week' | 'day';

// Mock Events (เพิ่มเวลา Start/End เพื่อให้เห็นผลใน Week View)
// หมายเหตุ: วันที่ใน mock data ควรแก้วันให้ตรงกับปัจจุบันเพื่อให้เห็นภาพ
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

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const { isMobile, isTablet, isDesktop } = useResponsive();

  let availableViews: ViewType[] = ['month', 'week', 'day']; // 1. ตั้งค่า Default ไว้ก่อนเลย (กันเหนียว)
  if (isMobile) {
    availableViews = [];    // 2. ถ้าเป็น Mobile ค่อยทับค่า
  } else if (isTablet) {
    availableViews = ['week', 'day']; // 3. ถ้าเป็น Tablet ค่อยทับค่า
  } else {
    availableViews = ['month', 'week', 'day']
  }

  // --- 2. Navigation Logic ---
  const next = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => setCurrentDate(new Date());

// --- 1. Logic การบังคับเปลี่ยน View (Auto-switch) ---
  useEffect(() => {
    if (isMobile) {
      // กรณี Mobile: บังคับเป็น Day เท่านั้น
      // เช็คก่อนว่า "ถ้าไม่ใช่ Day ค่อยเปลี่ยน" (เพื่อกัน Loop และ Re-render ไม่จำเป็น)
      if (view !== 'day') {
        setView('day');
      }
    } else if (isTablet) {
      // กรณี Tablet: รองรับ Week และ Day
      // ดังนั้นถ้า User ดู Month อยู่ ต้องดีดกลับมาเป็น Week
      // (แต่ถ้าดู Day อยู่แล้ว ก็ปล่อยไว้ได้ หรือถ้าอยากบังคับ Week เสมอก็แก้เงื่อนไขตรงนี้)
      if (view === 'month') {
        setView('week');
      }
    }
    // กรณี Desktop: ปล่อยฟรี ไม่ต้องทำอะไร
    
  }, [isMobile, isTablet, view]); // ใส่ view เข้ามาด้วย เพื่อให้เช็คค่าล่าสุดเสมอ

  return (
    <div className="h-full dark:bg-main-background bg-white text-gray-200 font-sans">
      <div className="flex flex-col h-[80vh] max-w-7xl mx-auto border dark:border-sidebar rounded-lg dark:bg-card border-light-hover shadow-2xl overflow-hidden">
        
        {/* --- Header Controls --- */}
        <div className="flex sm:flex-row sm:gap-0 gap-2 flex-col items-center justify-between px-6 py-4 border-b dark:border-sidebar dark:bg-sidebar bg-light-hover text-white">
          <div className="flex md:flex-row flex-col sm:items-start items-center md:gap-4 gap-2">
            <h2 className="sm:text-start text-center text-2xl font-bold text-white lg:w-64 md:w-full">
              {format(currentDate, view === 'day' ? 'd MMMM yyyy' : 'MMMM yyyy')}
            </h2>
            {!isMobile && (
              <div className="flex border dark:border-hover rounded-lg p-1">
                {/* ปุ่มสลับ View */}
                {availableViews.map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`
                      px-4 py-1 rounded capitalize text-sm font-medium transition-all
                      ${view === v 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'dark:text-gray-400 dark:hover:bg-hover text-gray-300 hover:text-white hover:bg-light-card'}
                    `}
                  >
                    {/* แปลง text ให้สวยงาม (optional) */}
                    {v === 'month' ? 'Month' : v === 'week' ? 'Week' : 'Day'}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button onClick={prev} className="px-3 py-1 dark:bg-card dark:hover:bg-hover border border-white rounded hover:bg-light-card text-sm">Prev</button>
            <button onClick={today} className="px-3 py-1 dark:bg-card dark:hover:bg-hover border border-white rounded hover:bg-light-card text-sm">Today</button>
            <button onClick={next} className="px-3 py-1 dark:bg-card dark:hover:bg-hover border border-white rounded hover:bg-light-card text-sm">Next</button>
          </div>
        </div>

        {/* --- Body: Render ตาม View --- */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {view === 'month' && <MonthView currentDate={currentDate} />}
          {(view === 'week' || view === 'day') && <TimeGridView currentDate={currentDate} view={view} />}
        </div>
      </div>
    </div>
  );
}

// --- Component: Month View (แบบเดิม) ---
function MonthView({ currentDate }: { currentDate: Date }) {
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
           const dayEvents = EVENTS.filter(e => isSameDay(e.start, day));
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
                {dayEvents.map(evt => (
                  <div key={evt.id} className={`text-xs px-1.5 py-0.5 rounded border-l-2 truncate ${evt.color}`}>
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

// --- Component: Time Grid View (สำหรับ Week และ Day) ---
function TimeGridView({ currentDate, view }: { currentDate: Date, view: 'week' | 'day' }) {
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
      <div className={`grid border-b dark:border-sidebar dark:bg-sidebar bg-light-hover ${view === 'day' ? 'grid-cols-1 md:pl-16 pl-0' : 'grid-cols-7 pl-16'}`}>
        {days.map(day => (
          <div key={day.toString()} className={`py-3 text-center border-r dark:border-sidebar last:border-0 ${isSameDay(day, new Date()) ? 'dark:text-blue-500 text-violet-900' : 'dark:text-gray-400'}`}>
            <div className="text-xs uppercase font-bold">{format(day, 'EEE')}</div>
            <div className={`text-xl font-light ${isSameDay(day, new Date()) ? 'dark:bg-blue-600/20 bg-violet-900/20 font-semibold inline-block px-2 rounded-full' : ''}`}>
                {format(day, 'd')}
            </div>
          </div>
        ))}
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