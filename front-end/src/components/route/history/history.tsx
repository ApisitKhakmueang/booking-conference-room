'use client'

import { BookingEvent } from "@/utils/interface/interface";
import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import CardEvents, { CardEventsSkeleton } from "./event-card";
import DesktopSidebar from "./desktop-sidebar";
import { Button } from "@/components/ui/button";
import MonthYearPicker from "./month-year-picker";
import { useMapResponseToEvents } from "@/hooks/data/useMapRespToEvent";
import { bookingService } from "@/service/booking.service";

const tabs = ["ALL", "COMPLETED", "CANCELLED"];

export default function History() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [events, setEvents] = useState<BookingEvent[] | undefined>(undefined);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredEvents = useMemo(() => {
    if (!events) return undefined;
    
    return events.filter((event) => {
      // 🌟 1. กรองเดือน/ปี (เหมือนเดิม)
      const eventDate = new Date(event.startTime); 
      if (!isSameMonth(eventDate, currentDate)) return false;

      // 🌟 2. กรองห้อง (เหมือนเดิม)
      if (selectedRooms.length > 0) {
        if (event.room?.roomNumber === undefined) return false;
        if (!selectedRooms.includes(event.room.roomNumber)) return false; 
      }

      // 🌟 3. เพิ่มการกรองตาม Tab (เพิ่มใหม่)
      // ใช้ .toLowerCase() เพื่อให้เปรียบเทียบกับข้อมูลใน Mock ได้โดยไม่มีปัญหาเรื่องตัวพิมพ์ใหญ่
      if (activeTab !== "ALL") {
        if (event.status.toLowerCase() !== activeTab.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
    // 🌟 อย่าลืมใส่ activeTab ลงใน Dependency Array ด้วยนะครับ
  }, [events, selectedRooms, currentDate, activeTab]);

  const next = () => {
    const nextDate = addMonths(currentDate, 1)
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (nextDate > today) 
      return
    setCurrentDate(nextDate);
  };

  const prev = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const today = () => {
    setCurrentDate(new Date())
  };

  const isNextDisabled = useMemo(() => {
    const nextDate = addMonths(currentDate, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return nextDate > today;
  }, [currentDate]);

  const fetchUserBookings = useCallback(async () => {
    const formattedDate = format(currentDate, 'yyyy-MM');
    try {
      const data = await bookingService.fetchUserHistory(formattedDate);
      const formattedEvents = useMapResponseToEvents(data);
      setEvents(formattedEvents);
    } catch (error) {
      console.log('error: ', error);
    }
  }, [currentDate.getMonth(), currentDate.getFullYear()]); // 🌟 เพิ่ม dependency ของเดือนและปี เพื่อให้ fetch ใหม่เมื่อเปลี่ยนเดือนหรือปี

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]); // อย่าลืมใส่ dependency

  return (
    <div className="bg-light-main-background dark:bg-main-background flex">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex sm:flex-row flex-col justify-between gap-5 shrink-0 xl:pr-8">
            {/* <p className="text-2xl">{format(currentDate, 'MMMM yyyy')}</p> */}
            <div className="flex items-center gap-4">
              <MonthYearPicker 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={prev} className="h-fit px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Prev</Button>
              <Button onClick={today} className="h-fit px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Today</Button>
              <Button onClick={next} className={`h-fit px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer  ${isNextDisabled ? 'opacity-50' : ''}`}>Next</Button>
              <Button onClick={() => setIsMobileFilterOpen(true)} className="h-fit px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer xl:hidden block">Filter</Button>
            </div>
          </header>

          <div className="flex items-center xs:gap-8 gap-5 border-b border-gray-100 dark:border-white/10 px-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 text-sm font-bold tracking-widest transition-all duration-300 cursor-pointer
                  ${
                    activeTab === tab
                      ? "text-purple-400" // สีตอนเลือก (อ้างอิงจากสีม่วงในรูป)
                      : "hover:text-white" // สีตอนไม่ได้เลือก
                  }`}
              >
                {tab}
                
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 h-[3px] w-full bg-purple-400 transition-all duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex">
            <main className="flex-1 space-y-4 overflow-y-auto py-4 md:py-8 xl:pr-8 no-scrollbar">
              {/* 🌟 3. เปลี่ยนจาก events.map เป็น filteredEvents.map เพื่อแสดงเฉพาะอันที่กรองแล้ว */}
              {events === undefined ? (
                // ถ้า events ยังเป็น undefined แสดงว่ากำลังโหลด ให้จำลอง Skeleton ขึ้นมา 3 กล่อง
                Array.from({ length: 3 }).map((_, index) => (
                  <CardEventsSkeleton key={index} />
                ))
              ) : filteredEvents && filteredEvents.length > 0 ? (
                // ถ้าโหลดเสร็จแล้ว และมีข้อมูล ก็ map การ์ดจริงตามปกติ
                filteredEvents.map((event) => (
                  <div key={event.id}>
                    <CardEvents 
                      event={event} 
                      setCurrentDate={setCurrentDate} 
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
        <div>
          <DesktopSidebar 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            events={events} // 🌟 ส่ง filteredEvents ให้การ์ด Total นับเลขได้ถูกต้อง
            selectedRooms={selectedRooms}       // 🌟 ส่ง State ลงไป
            setSelectedRooms={setSelectedRooms} // 🌟 ส่งฟังก์ชันแก้ไข State ลงไป
          />
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-100 flex items-end bg-black/50 xl:hidden">
          <div className="w-full max-h-[85vh] flex flex-col bg-light-main-background dark:bg-card rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-end items-center shrink-0">
              <button 
                className="text-gray-500 hover:text-white"
                onClick={() => {
                  setIsMobileFilterOpen(false)
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
  )
}