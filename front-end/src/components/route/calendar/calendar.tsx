'use client'

import { useState, useEffect, useCallback } from 'react';
import { useResponsive } from '@/hooks/ui/useMediaQuery';
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, setHours, setMinutes, parseISO,
  startOfWeek, startOfMonth, endOfMonth, endOfWeek
} from 'date-fns';
import MonthView from './calendarMonthView';
import TimeGridView from './calendarTimeGridView';
import axios from 'axios';
import { Holiday } from '@/lib/interface/response';
import { useBookingWebSocket } from '@/hooks/data/useBookingWebsocket';

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
  const [holiday, setHoliday] = useState<Holiday[] | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const { isMobile, isTablet } = useResponsive();
  const [isLoadingHoliday, setIsLoadingHoliday] = useState(true);
  
  const currentYear = currentDate.getFullYear();
  const startYear = `${currentYear}-01-01`;
  const endYear = `${currentYear}-12-31`;
  const { bookings, isLoadingBooking } = useBookingWebSocket(1, startYear, endYear)

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

  const fetchHolidays = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_BACKEND_HTTP
    try{
      setIsLoadingHoliday(true)
      const response = await axios.get(`${url as string}/api/holiday?startDate=${startYear}&endDate=${endYear}`)
      const rawDate = response.data
      const holidays = rawDate.map((holiday: Holiday) => {
        return {
          ...holiday, // copy ค่าเดิมมาทั้งหมด (id, name, isDayOff)
          
          // แปลง string '2026-01-01' -> Date Object
          date: parseISO(holiday.date), 
          
          // แปลง string '2026-02-07T...' -> Date Object
          updatedAt: holiday.updatedAt ? parseISO(holiday.updatedAt) : null 
        };
      });

      // console.log("holidays: ", holidays)
      setHoliday(holidays)
    } catch(error) {
      console.log('error: ', error);
    } finally {
      setIsLoadingHoliday(false)
    }
  }, [currentDate.getFullYear()])

  // const fetchEvents = useCallback(async () => {
  //   try {
  //     const url = process.env.NEXT_PUBLIC_BACKEND_HTTP
  //     const response = await axios.get(`${url as string}/api/booking/1?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`)
  //     const rawDate = response.data
  //     const events = rawDate?.map((event: BookingEvent) => {
  //       return {
  //         ...event, // copy ค่าเดิมมาทั้งหมด (id, name, isDayOff)
          
  //         // แปลง string '2026-01-01' -> Date Object
  //         startTime: parseISO(event.startTime), 
  //         endTime: parseISO(event.endTime),
  //       };
  //     });
  //     console.log("events: ", events)

  //     setEvents(events)
  //   } catch(error) {
  //     console.log("error: ", error)
  //   }
  // }, [start, end])

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

  useEffect(() => {
    fetchHolidays()
    // fetchEvents()
  }, [currentYear])

  const isSyncing = isLoadingBooking || isLoadingHoliday;

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
                      px-4 py-1 rounded capitalize text-sm font-medium transition-all cursor-pointer
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
          
          <div className='flex gap-4 items-center'>
            <div>
              test
            </div>
            <div className="flex gap-2">
              <button onClick={prev} className="px-3 py-1 dark:hover:bg-hover border dark:border-hover border-white rounded hover:bg-light-card text-sm p-1 cursor-pointer">Prev</button>
              <button onClick={today} className="px-3 py-1 dark:hover:bg-hover border dark:border-hover border-white rounded hover:bg-light-card text-sm p-1 cursor-pointer">Today</button>
              <button onClick={next} className="px-3 py-1 dark:hover:bg-hover border dark:border-hover border-white rounded hover:bg-light-card text-sm p-1 cursor-pointer">Next</button>
            </div>
          </div>
        </div>

        {/* --- Body: Render ตาม View --- */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {view === 'month' && <MonthView currentDate={currentDate} bookingEvents={bookings} holiday={holiday} isSyncing={isSyncing} />}
          {(view === 'week' || view === 'day') && <TimeGridView currentDate={currentDate} view={view} holiday={holiday} />}
        </div>
      </div>
    </div>
  );
}