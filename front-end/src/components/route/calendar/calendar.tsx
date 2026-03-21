'use client'

// Library
import { useState, useEffect, useMemo } from 'react';
import { useResponsive } from '@/hooks/ui/useMediaQuery';
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
} from 'date-fns';

// Component
import MonthView from './calendarMonthView';
import TimeGridView from './calendarTimeGridView';
import RoomSelector from './roomSelector';
import Modal from '@/components/ui/modal';
import { ArrangeRoom } from '@/utils/interface/interface';

// Hook
import { useBookingWebSocket } from '@/hooks/data/useBookingWebsocket';
import { useRoomStore } from '@/stores/room.store';
import { useShallow } from 'zustand/shallow';
import { useHolidays } from '@/hooks/data/useHolidays';
import { Button } from '@/components/ui/button';

// --- 1. Types & Mock Data ---
type ViewType = 'month' | 'week' | 'day';

// Mock Events (เพิ่มเวลา Start/End เพื่อให้เห็นผลใน Week View)
// หมายเหตุ: วันที่ใน mock data ควรแก้วันให้ตรงกับปัจจุบันเพื่อให้เห็นภาพ

export default function Calendar() {
  const { rawRoom } = useRoomStore(
    useShallow(((state) => ({
      rawRoom: state.rooms
    })))
  )
  
  const rooms = useMemo(() => {
    // ดักไว้ก่อนว่าถ้าไม่มีข้อมูล ให้ return array เปล่าๆ ออกไป
    if (!rawRoom) return [];

    // 🌟 แปลงร่างด้วย .map() และต่อด้วย .sort() ได้เลย
    return rawRoom
      .map((room) => ({
        id: room.id,
        name: room.name,
        roomNumber: room.roomNumber
      }))
      .sort((a, b) => a.roomNumber - b.roomNumber); // เรียงน้อยไปมาก
  }, [rawRoom])

  const [selectedRoom, setSelectedRoom] = useState<ArrangeRoom | undefined>(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const { isMobile, isTablet } = useResponsive();
  const [isLoadingRoom, setIsLoadingRoom] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const currentYear = currentDate.getFullYear();
  const startYear = `${currentYear}-01-01`;
  const endYear = `${currentYear}-12-31`;
  const currentRoomNumber = selectedRoom?.roomNumber ?? 0;
  const { bookings, isLoadingBooking } = useBookingWebSocket(currentRoomNumber, startYear, endYear)
  const { holiday, isLoadingHoliday } = useHolidays(startYear, endYear);

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

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
      setIsLoadingRoom(false)
    }
  }, [rooms, selectedRoom]);

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

  const isSyncing = isLoadingBooking || isLoadingHoliday || isLoadingRoom;

  const sharedProps = {
    currentDate,
    bookings,
    holiday,
    isSyncing
  };

  return (
    <div className="flex-1 dark:bg-main-background bg-white text-gray-200 font-sans pb-3">
      {/* Edit h-[80vh] for expand to height screen */}
      <div className="flex flex-col h-[78vh] max-w-7xl mx-auto border dark:border-sidebar rounded-lg dark:bg-card border-light-hover shadow-2xl overflow-hidden">
        
        {/* --- Header Controls --- */}
        <div className="flex sm:flex-row sm:gap-0 gap-2 flex-col items-center justify-between px-6 py-4 border-b dark:border-sidebar dark:bg-sidebar bg-light-hover text-white">
          <div className="flex lg:flex-row flex-col items-center justify-center md:gap-4 gap-2">
            <h2 className="sm:text-start text-2xl font-bold text-white">
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
                        ? 'bg-blue-600 dark:bg-dark-purple text-white shadow' 
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
          
          <div className='flex xl:flex-row flex-col gap-2 items-center'>
            <div className='flex flex-row gap-2 items-center'>
              {view === 'month' &&
                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  className="px-3 py-2 border dark:border-none border-blue-600 bg-blue-600 hover:bg-blue-700 dark:border-dark-purple/80 dark:bg-dark-purple/80 dark:hover:bg-dark-purple text-white shadow text-sm cursor-pointer rounded whitespace-nowrap"
                  >Add Booking</Button>
              }
              <RoomSelector 
                selectedRoom={selectedRoom} 
                setSelectedRoom={setSelectedRoom} 
                rooms={rooms}
                className='px-3 py-4.5 border dark:border-hover text-white border-white rounded text-sm cursor-pointer duration-0' />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={prev} className="px-3 py-2 dark:hover:bg-hover border dark:border-hover border-white rounded hover:bg-light-card bg-transparent text-sm cursor-pointer">Prev</Button>
              <Button onClick={today} className="px-3 py-2 dark:hover:bg-hover border dark:border-hover border-white rounded hover:bg-light-card bg-transparent text-sm cursor-pointer">Today</Button>
              <Button onClick={next} className="px-3 py-2 dark:hover:bg-hover border dark:border-hover border-white rounded hover:bg-light-card bg-transparent text-sm cursor-pointer">Next</Button>
            </div>
          </div>
        </div>

        {/* --- Body: Render ตาม View --- */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {view === 'month' && <MonthView {...sharedProps} setView={setView} setCurrentDate={setCurrentDate} />}
          {(view === 'week' || view === 'day') && <TimeGridView {...sharedProps} view={view} />}
        </div>
      </div>

      <Modal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} typeOperate='add' currentDate={currentDate} />
    </div>
  );
}