'use client'

// Library
import { useState, useEffect, useMemo } from 'react';
import { useResponsive } from '@/hooks/ui/useMediaQuery';
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
} from 'date-fns';

// Component
import MonthView from './calendar-month-view';
import TimeGridView from './calendar-time-grid-view';
import RoomSelector from './room-selector';
import BookingModal from '@/components/utils/booking-modal';
import { ArrangeRoom } from '@/utils/interface/interface';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Hook
import { useBookingWebSocket } from '@/hooks/data/useBookingWebsocket';
import { useHolidays } from '@/hooks/data/useHolidays';
import { useAuthStore } from '@/stores/auth.store';
import { useRoomData } from '@/hooks/data/useRoomData';

// --- 1. Types & Mock Data ---
type ViewType = 'month' | 'week' | 'day';

// Mock Events (เพิ่มเวลา Start/End เพื่อให้เห็นผลใน Week View)
// หมายเหตุ: วันที่ใน mock data ควรแก้วันให้ตรงกับปัจจุบันเพื่อให้เห็นภาพ

export default function Calendar() {
  const currentUser = useAuthStore((state) => state.user);

  const { room: rawRoom, isLoading, isError } = useRoomData();
  
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  
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
    setCurrentDate,
    currentDate,
    bookings,
    holiday,
    isSyncing,
    currentUser
  };

  return (
    <div className="flex-1 dark:bg-main-background bg-white text-gray-200 font-sans pb-3">
      {/* Edit h-[80vh] for expand to height screen */}
      <div className="flex flex-col h-[78vh] max-w-7xl mx-auto border dark:border-sidebar rounded-lg dark:bg-card border-light-hover shadow-2xl overflow-hidden">
        
        {/* --- Header Controls --- */}
        {/* 🌟 1. เปลี่ยนพื้นหลัง Header ให้เป็นสีขาว/สว่าง และใช้เส้นขอบสีเทาอ่อน */}
        <div className="flex sm:flex-row flex-col items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-sidebar bg-white dark:bg-sidebar gap-4">
          <div className="flex flex-wrap items-center sm:justify-start justify-center gap-4">
            
            {/* 🌟 2. ตัวหนังสือชื่อเดือน ใช้สีม่วงเข้มใน Light mode และสีขาวใน Dark mode */}
            {/* <h2 className="sm:text-start text-center text-2xl font-bold text-dark-purple dark:text-white">
              {format(currentDate, view === 'day' ? 'd MMMM yyyy' : 'MMMM yyyy')}
            </h2> */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity outline-none">
                  <h2 className="sm:text-start text-center text-2xl font-bold text-dark-purple dark:text-white">
                    {format(currentDate, view === 'day' ? 'd MMMM yyyy' : 'MMMM yyyy')}
                  </h2>
                  <ChevronDown className="w-6 h-6 text-light-secondary dark:text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </PopoverTrigger>
              
              <PopoverContent 
                // 🌟 1. เพิ่ม overflow-hidden ตรงนี้ เพื่อให้กรอบ rounded-xl ตัดขอบปฏิทินที่เหลี่ยมๆ ออกไปให้เนียน
                className="w-auto p-0 bg-white dark:bg-sidebar border border-gray-200 dark:border-white/10 shadow-xl rounded-xl z-50 overflow-hidden" 
                align="start"
              >
                <CalendarComponent
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(date);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  // 🌟 2. บังคับสีพื้นหลังตรงนี้ด้วยเลย เพื่อป้องกันการดึงสีจาก CSS Variables ผิดตัว
                  className="bg-white dark:bg-sidebar dark:text-white"
                />
              </PopoverContent>
            </Popover>
            
            {!isMobile && (
              <div className="flex border border-gray-200 dark:border-hover rounded-lg p-1 bg-light-purple/30 dark:bg-transparent">
                {/* ปุ่มสลับ View */}
                {availableViews.map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`
                      px-4 py-1 rounded capitalize text-sm font-medium transition-all cursor-pointer
                      ${view === v 
                        // 🌟 3. เปลี่ยนจาก blue-600 เป็น dark-purple เพื่อให้คุมโทนสี
                        ? 'bg-dark-purple text-white shadow-md' 
                        : 'text-light-secondary dark:text-gray-400 hover:text-dark-purple dark:hover:text-white hover:bg-light-purple dark:hover:bg-hover'}
                    `}
                  >
                    {v === 'month' ? 'Month' : v === 'week' ? 'Week' : 'Day'}
                  </button>
                ))}
              </div>
            )}

            {/* 🌟 4. ปุ่ม Prev/Today/Next ใช้เส้นขอบสีเทาอ่อน และ hover เป็นสีม่วงอ่อน */}
            <div className="flex gap-2">
              <Button onClick={prev} className="px-3 py-2 border border-gray-200 text-light-secondary dark:text-white dark:border-hover rounded hover:bg-light-purple hover:text-dark-purple dark:hover:bg-hover dark:hover:text-white bg-transparent text-sm cursor-pointer transition-colors">Prev</Button>
              <Button onClick={today} className="px-3 py-2 border border-gray-200 text-light-secondary dark:text-white dark:border-hover rounded hover:bg-light-purple hover:text-dark-purple dark:hover:bg-hover dark:hover:text-white bg-transparent text-sm cursor-pointer transition-colors">Today</Button>
              <Button onClick={next} className="px-3 py-2 border border-gray-200 text-light-secondary dark:text-white dark:border-hover rounded hover:bg-light-purple hover:text-dark-purple dark:hover:bg-hover dark:hover:text-white bg-transparent text-sm cursor-pointer transition-colors">Next</Button>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <div className='flex flex-row gap-2 items-center'>
              <RoomSelector 
                selectedRoom={selectedRoom} 
                setSelectedRoom={setSelectedRoom} 
                rooms={rooms}
                // 🌟 5. Room selector ใช้ขอบเทา ตัวหนังสือสีเทาเข้ม
                className='px-3 py-4.5 border border-gray-200 text-light-main dark:text-white dark:border-hover bg-white dark:bg-sidebar rounded text-sm cursor-pointer duration-0 w-[140px]' 
              />
              {view === 'month' &&
                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  // 🌟 6. ปุ่ม Add Booking ใช้สีม่วงของแบรนด์เท่านั้น ไม่ใช้สีน้ำเงิน
                  className="px-4 py-2 bg-dark-purple hover:bg-dark-purple/90 dark:bg-dark-purple/80 dark:hover:bg-dark-purple text-white shadow-md text-sm cursor-pointer rounded whitespace-nowrap transition-all"
                >
                  <Plus className="w-4 h-4"/>&nbsp;
                  Add Booking
                </Button>
              }
            </div>
          </div>
        </div>

        {/* --- Body: Render ตาม View --- */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {view === 'month' && <MonthView {...sharedProps} setView={setView} />}
          {(view === 'week' || view === 'day') && <TimeGridView {...sharedProps} view={view} />}
        </div>
      </div>

      <BookingModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} typeOperate='add' setCurrentDate={setCurrentDate} currentDate={currentDate} preselectedRoomNumber={currentRoomNumber} />
    </div>
  );
}