"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, subDays } from "date-fns";
import DesktopSidebar from "./desktop-sidebar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Plus } from "lucide-react";
import CardEvents, { CardEventsSkeleton } from "./event-card";
import { BookingEvent } from "@/utils/interface/interface";
import { useMapResponseToEvents } from "@/hooks/data/ีuseMapRespToEvent";
import { bookingService } from "@/service/booking.service";


export default function Schedule() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | undefined>(undefined);
  const [events, setEvents] = useState<BookingEvent[] | undefined>(undefined);
  
  // 🌟 1. ย้าย State การเลือกห้องมาไว้ที่นี่!
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  // 🌟 2. สร้างตัวกรองข้อมูล (ถ้าไม่เลือกห้องเลย = แสดงทั้งหมด, ถ้าเลือก = แสดงเฉพาะห้องที่เลือก)
  const filteredEvents = useMemo(() => {
    if (!events) return undefined;
    if (selectedRooms.length === 0) return events; // ถ้าไม่มีการติ๊กเลย ให้แสดงทั้งหมด
    
    return events.filter((event) => {
      // 🌟 1. เช็คก่อนว่ามีข้อมูล roomNumber ไหม ถ้าไม่มีให้ข้ามไปเลย
      if (event.room?.roomNumber === undefined) return false;

      // 🌟 2. พอผ่านบรรทัดบนมาได้ TypeScript จะรู้ทันทีว่าตรงนี้คือ number แน่นอน 100%
      return selectedRooms.includes(event.room.roomNumber); 
    });
  }, [events, selectedRooms]);

  const next = () => {
   setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    const prevDate = subDays(currentDate, 1)
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (prevDate < today) 
      return
    setCurrentDate(prevDate);
  };

  const today = () => setCurrentDate(new Date());

  const isPrevDisabled = useMemo(() => {
    const prevDate = subDays(currentDate, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prevDate < today;
  }, [currentDate]);

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

  const fetchUserBookings = useCallback(async () => {
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    try {
      const data = await bookingService.fetchUserBookings(formattedDate);
      const formattedEvents = useMapResponseToEvents(data);
      setEvents(formattedEvents);
    } catch (error) {
      console.log('error: ', error);
    }
  }, [currentDate]); 

  useEffect(() => {
    if (isAddModalOpen) return
    setCurrentDate(new Date())
  }, [isAddModalOpen])

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]); // อย่าลืมใส่ dependency

  return (
    <div className="bg-light-main-background dark:bg-main-background flex">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex sm:flex-row flex-col justify-between gap-5 shrink-0 sm:pr-8">
            <p className="text-2xl">{format(currentDate, 'EEEE, d MMMM yyyy')}</p>

            <div className="flex gap-2">
              <Button onClick={handleAddClick} className="px-3 py-2 border dark:border-none border-blue-600 bg-blue-600 hover:bg-blue-700 dark:border-dark-purple/80 dark:bg-dark-purple/80 dark:hover:bg-dark-purple text-white shadow text-sm cursor-pointer rounded whitespace-nowrap xl:flex hidden">
                <Plus />&nbsp;Add Booking
              </Button>
              <Button onClick={prev} className={`px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer ${isPrevDisabled ? 'opacity-50' : ''}`}>Prev</Button>
              <Button onClick={today} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Today</Button>
              <Button onClick={next} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Next</Button>
              <Button onClick={() => setIsMobileFilterOpen(true)} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer xl:hidden block">Filter</Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex">
            <main className="flex-1 space-y-4 overflow-y-auto py-4 pr-4 md:py-8 md:pr-8 no-scrollbar">
              {/* 🌟 3. เปลี่ยนจาก events.map เป็น filteredEvents.map เพื่อแสดงเฉพาะอันที่กรองแล้ว */}
              {events === undefined ? (
                // ถ้า events ยังเป็น undefined แสดงว่ากำลังโหลด ให้จำลอง Skeleton ขึ้นมา 3 กล่อง
                Array.from({ length: 3 }).map((_, index) => (
                  <CardEventsSkeleton key={index} />
                ))
              ) : filteredEvents && filteredEvents.length > 0 ? (
                // ถ้าโหลดเสร็จแล้ว และมีข้อมูล ก็ map การ์ดจริงตามปกติ
                filteredEvents.map((event) => (
                  <div key={event.id} onClick={() => handleEditClick(event)}>
                    <CardEvents 
                      event={event} 
                      setIsAddModalOpen={setIsAddModalOpen} 
                      setCurrentDate={setCurrentDate} 
                      onDeleteSuccess={fetchUserBookings}
                    />
                  </div>
                ))
              ) : (
                // ถ้าโหลดเสร็จแล้ว แต่ไม่มีข้อมูลการจองเลยในวันนั้น
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-lg font-medium">No Content</p>
                  <p className="text-sm whitespace-nowrap">You don't have any bookings for this day.</p>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="">
          <DesktopSidebar 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            events={filteredEvents} // 🌟 ส่ง filteredEvents ให้การ์ด Total นับเลขได้ถูกต้อง
            selectedRooms={selectedRooms}       // 🌟 ส่ง State ลงไป
            setSelectedRooms={setSelectedRooms} // 🌟 ส่งฟังก์ชันแก้ไข State ลงไป
          />
        </div>
      </div>

      <Modal 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={setIsAddModalOpen} 
        typeOperate={typeOperate} 
        currentDate={currentDate}
        selectedEvent={selectedEvent} 
        onSuccess={fetchUserBookings} 
      />

      {/* Mobile Action Button (FAB) */}
      <Button 
        className='absolute bg-blue-600 hover:bg-blue-700 dark:bg-dark-purple/80 dark:hover:bg-dark-purple bottom-7 right-7 w-12 h-12 rounded-full shadow-lg transition-all xl:hidden flex'
        onClick={() => setIsAddModalOpen(true)}>
        <Plus className='w-8! h-8! text-white stroke-[2.5px]'/>
      </Button>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-100 flex items-end bg-black/50 xl:hidden">
          <div className="w-full max-h-[85vh] flex flex-col bg-light-main-background dark:bg-card rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-light-main dark:text-main uppercase tracking-widest">Filter Rooms</h2>
              <button 
                className="text-gray-500 hover:text-white"
                onClick={() => {
                  setIsMobileFilterOpen(false)
                  setSelectedRooms([])
                  }}>✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <DesktopSidebar 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
                events={filteredEvents} 
                className="flex xs:flex-row flex-col w-full border-none space-y-6 lg:px-60 md:px-40 gap-5"
                selectedRooms={selectedRooms}       // 🌟 ส่ง State ลงไปใน Mobile ด้วย
                setSelectedRooms={setSelectedRooms} 
              />
            </div>

            <Button 
              className="w-full shrink-0 py-3 mt-4 bg-dark-purple/80 hover:bg-dark-purple text-white rounded-xl font-medium"
              onClick={() => setIsMobileFilterOpen(false)}>
              Show Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}