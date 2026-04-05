"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, isSameDay, subDays } from "date-fns";
import DesktopSidebar from "./desktop-sidebar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/utils/booking-modal";
import { Plus } from "lucide-react";
import { CardEventsSkeleton } from "./event-card";
import { BookingEvent, RenderEventGroupProps } from "@/utils/interface/interface";
import { useMapResponseToEvents } from "@/hooks/data/useMapRespToEvent";
import { bookingService } from "@/service/booking.service";
import MobileFilter from "./mobile-filter";
import { RenderEventGroup } from "./event-group";

export default function Schedule() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | undefined>(undefined);
  const [events, setEvents] = useState<BookingEvent[] | undefined>(undefined);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  // 🌟 1. สร้าง State นาฬิกา เพื่อให้อัปเดตเวลาปัจจุบันตลอด
  const [now, setNow] = useState(new Date());

  // 🌟 2. สั่งให้นาฬิกาเดินทุกๆ 1 นาที
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ตัวกรองห้องและวันที่ (ของเดิม)
  const filteredEvents = useMemo(() => {
    if (!events) return undefined;
    return events.filter((event) => {
      const eventDate = new Date(event.startTime); 
      if (!isSameDay(eventDate, currentDate)) return false;
      if (selectedRooms.length > 0) {
        if (event.room?.roomNumber === undefined) return false;
        if (!selectedRooms.includes(event.room.roomNumber)) return false; 
      }
      return true;
    });
  }, [events, selectedRooms, currentDate]);

  // 🌟 3. ฟังก์ชันคำนวณสถานะ Real-time
  const getLiveStatus = useCallback((startTime: string | Date, endTime: string | Date) => {
    const startTimeMs = new Date(startTime).getTime();
    const endTimeMs = new Date(endTime).getTime();
    const currentTimeMs = now.getTime();
    
    const diffMinutes = (startTimeMs - currentTimeMs) / (1000 * 60);

    if (currentTimeMs >= startTimeMs && currentTimeMs <= endTimeMs) {
      return 'in-progress';
    } else if (diffMinutes > 0 && diffMinutes <= 15) {
      return 'upcoming';
    } else if (currentTimeMs > endTimeMs) {
      return 'completed';
    }
    return 'normal';
  }, [now]); // คำนวณใหม่เมื่อเวลา now เปลี่ยน

  // 🌟 4. จัดกลุ่ม Event ตามสถานะ
  const groupedEvents = useMemo(() => {
    if (!filteredEvents) return null;

    const groups: Record<string, BookingEvent[]> = {
      inProgress: [],
      upcoming: [],
      normal: [],
    };

    filteredEvents.forEach(event => {
      const status = getLiveStatus(event.startTime, event.endTime);
      if (status === 'in-progress') groups.inProgress.push(event);
      else if (status === 'upcoming') groups.upcoming.push(event);
      else groups.normal.push(event);
    });

    return groups;
  }, [filteredEvents, getLiveStatus]);

  // ฟังก์ชันเปลี่ยนวันที่ (ของเดิม)
  const next = () => {
    setCurrentDate(addDays(currentDate, 1));
    setCurrentMonth(addDays(currentDate, 1));
  };

  const prev = () => {
    const prevDate = subDays(currentDate, 1)
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (prevDate < today) return;
    setCurrentDate(prevDate);
    setCurrentMonth(prevDate);
  };

  const today = () => {
    setCurrentDate(new Date());
    setCurrentMonth(new Date());
  };

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
    const formattedDate = format(currentDate, 'yyyy-MM');
    try {
      const data = await bookingService.fetchUserBookings(formattedDate);
      const formattedEvents = useMapResponseToEvents(data);
      setEvents(formattedEvents);
    } catch (error) {
      console.log('error: ', error);
    }
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const modalFilterProps = { 
    setIsMobileFilterOpen, currentDate, setCurrentDate, currentMonth, setCurrentMonth, filteredEvents, selectedRooms, setSelectedRooms 
  }

  const renderEventGroupProps: RenderEventGroupProps = {
    title: '', groupEvents: [], titleColor: '', handleEditClick, setIsAddModalOpen, setCurrentDate, fetchUserBookings 
  }

  return (
    <div className="bg-light-main-background dark:bg-main-background flex">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex sm:flex-row flex-col justify-between gap-5 shrink-0 xl:pr-8 pt-4">
            <p className="text-2xl font-semibold">{format(currentDate, 'EEEE, d MMMM yyyy')}</p>

            <div className="flex gap-2 pr-4 md:pr-0">
              <Button onClick={handleAddClick} className="px-3 py-2 border dark:border-none border-blue-600 bg-blue-600 hover:bg-blue-700 dark:border-dark-purple/80 dark:bg-dark-purple/80 dark:hover:bg-dark-purple text-white shadow text-sm cursor-pointer rounded whitespace-nowrap xl:flex hidden">
                <Plus className="w-4 h-4"/>&nbsp;Add Booking
              </Button>
              <Button onClick={prev} className={`px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer ${isPrevDisabled ? 'opacity-50' : ''}`}>Prev</Button>
              <Button onClick={today} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Today</Button>
              <Button onClick={next} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Next</Button>
              <Button onClick={() => setIsMobileFilterOpen(true)} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer xl:hidden block">Filter</Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex">
            <main className="flex-1 overflow-y-auto py-4 md:py-8 xl:pr-8 no-scrollbar pb-24">
              {events === undefined ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => <CardEventsSkeleton key={index} />)}
                </div>
              ) : filteredEvents && filteredEvents.length > 0 && groupedEvents ? (
                
                // 🌟 5. Render กลุ่มต่างๆ เรียงลำดับความสำคัญ
                <div>
                  {/* กำลังใช้งาน (In Progress) */}
                  <RenderEventGroup {...renderEventGroupProps} title="In Progress" groupEvents={groupedEvents.inProgress} titleColor="text-red-500 dark:text-red-400" />
                  
                  {/* กำลังจะเริ่ม (Upcoming) */}
                  <RenderEventGroup {...renderEventGroupProps} title="Upcoming" groupEvents={groupedEvents.upcoming} titleColor="text-amber-500 dark:text-amber-400" />
                  
                  {/* จองปกติ (Normal Bookings) */}
                  <RenderEventGroup {...renderEventGroupProps} title="Scheduled Bookings" groupEvents={groupedEvents.normal} titleColor="text-blue-600 dark:text-blue-400" />
                </div>

              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[60vh] opacity-70">
                  <p className="text-lg font-medium">No Content</p>
                  <p className="text-sm text-center">You don't have any bookings matching the criteria.</p>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="shrink-0 h-full overflow-y-auto no-scrollbar">
          <DesktopSidebar 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            events={filteredEvents} 
            selectedRooms={selectedRooms}       
            setSelectedRooms={setSelectedRooms} 
          />
        </div>
      </div>

      <BookingModal 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={setIsAddModalOpen} 
        typeOperate={typeOperate} 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedEvent={selectedEvent} 
        onSuccess={fetchUserBookings} 
      />

      <Button 
        className='fixed bg-blue-600 hover:bg-blue-700 dark:bg-dark-purple/80 dark:hover:bg-dark-purple bottom-7 right-7 w-12 h-12 rounded-full shadow-lg transition-all xl:hidden flex z-40'
        onClick={handleAddClick}>
        <Plus className='w-8! h-8! text-white stroke-[2.5px]'/>
      </Button>

      {isMobileFilterOpen && <MobileFilter {...modalFilterProps} />}
    </div>
  );
}