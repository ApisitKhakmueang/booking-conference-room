"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, subDays } from "date-fns";
import DesktopSidebar from "./desktopSidebar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Plus } from "lucide-react";
import CardEvents from "./eventCard";
import { BookingEvent } from "@/utils/interface/interface";

export const mockEvents: BookingEvent[] = [
  {
    id: "1",
    title: "Executive Board Meeting",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Quarterly performance review and strategic planning.",
    startTime: "09:00",
    startAmpm: "AM",
    endTime: "11:00",
    endAmpm: "AM",
    room: "Conference A",
    status: "Confirmed",
    duration: 120,
    guestsCount: 4, 
  },
  {
    id: "2",
    title: "VIP Private Luncheon",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Host: Sarah Jenkins. Custom catering requirements attached.",
    startTime: "11:30",
    startAmpm: "AM",
    endTime: "01:30",
    endAmpm: "PM",
    room: "Suite 402",
    status: "Confirmed",
    duration: 90,
  },
  {
    id: "3",
    title: "Tech Founders Meetup",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Informal networking session for local entrepreneurs.",
    startTime: "02:00",
    startAmpm: "PM",
    endTime: "04:00",
    endAmpm: "PM",
    room: "Lounge West",
    status: "Pending",
    duration: 60,
  },
  {
    id: "4",
    title: "Design Review: Project Velvet",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Presentation of initial UI prototypes and brand strategy.",
    startTime: "04:30",
    startAmpm: "PM",
    endTime: "06:30",
    endAmpm: "PM",
    room: "Conference B",
    status: "Confirmed",
    duration: 45,
  },
  {
    id: "5",
    title: "Executive Board Meeting",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Quarterly performance review and strategic planning.",
    startTime: "09:00",
    startAmpm: "AM",
    endTime: "11:00",
    endAmpm: "AM",
    room: "Conference A",
    status: "Confirmed",
    duration: 120,
    guestsCount: 4, 
  },
  {
    id: "6",
    title: "VIP Private Luncheon",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Host: Sarah Jenkins. Custom catering requirements attached.",
    startTime: "11:30",
    startAmpm: "AM",
    endTime: "01:30",
    endAmpm: "PM",
    room: "Suite 402",
    status: "Confirmed",
    duration: 90,
  },
  {
    id: "7",
    title: "Tech Founders Meetup",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Informal networking session for local entrepreneurs.",
    startTime: "02:00",
    startAmpm: "PM",
    endTime: "04:00",
    endAmpm: "PM",
    room: "Lounge West",
    status: "Pending",
    duration: 60,
  },
  {
    id: "8",
    title: "Design Review: Project Velvet",
    date: "2026-03-26T16:20:00+07:00", 
    description: "Presentation of initial UI prototypes and brand strategy.",
    startTime: "04:30",
    startAmpm: "PM",
    endTime: "06:30",
    endAmpm: "PM",
    room: "Conference B",
    status: "Confirmed",
    duration: 45,
  }
];

export default function Schedule() {
  // State สำหรับเปิดปิด Mobile Modal (จำลอง)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | undefined>(undefined);

  const next = () => {
   setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    const prevDate = subDays(currentDate, 1)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาให้เป็นเที่ยงคืน จะได้เทียบแค่วันที่
    if (prevDate < today) // ถ้าวันนั้นน้อยกว่าวันนี้ ให้ปิดการใช้งาน
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
    setSelectedEvent(undefined); // เคลียร์ข้อมูลเก่า
    setIsAddModalOpen(true);
  };

  const handleEditClick = (event: BookingEvent) => {
    setTypeOperate('update');
    setSelectedEvent(event); // เก็บข้อมูล event ที่ถูกคลิก
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (isAddModalOpen) return
    setCurrentDate(new Date())
  }, [isAddModalOpen])

  return (
    <div className="bg-light-main-background dark:bg-main-background flex">
      
      {/* 🌟 สมมติว่าด้านซ้ายสุดเป็น Sidebar หลักของระบบคุณ (ที่มีเมนู Calendar, Rooms) */}
      {/* <MainSystemSidebar /> */}

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex shrink-0 justify-between pr-8">
            <p className="text-2xl">{format(currentDate, 'EEEE, d MMMM yyyy')}</p>

            <div className="flex gap-2">
              <Button onClick={handleAddClick} className="px-3 py-2 border dark:border-none border-blue-600 bg-blue-600 hover:bg-blue-700 dark:border-dark-purple/80 dark:bg-dark-purple/80 dark:hover:bg-dark-purple text-white shadow text-sm cursor-pointer rounded whitespace-nowrap">
                <Plus />&nbsp;Add Booking
              </Button>
              <Button onClick={prev} className={`px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer ${isPrevDisabled ? 'opacity-50' : ''}`}>Prev</Button>
              <Button onClick={today} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Today</Button>
              <Button onClick={next} className="px-3 py-2 dark:bg-sidebar dark:hover:bg-hover border dark:border-hover border-white rounded bg-dark-purple hover:bg-light-card text-sm cursor-pointer">Next</Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex">
            
            {/* Main List Scrollable */}
            <main className="flex-1 space-y-4 overflow-y-auto p-4 md:p-8 no-scrollbar">
              {mockEvents.map((event) => (
                <div key={event.id} onClick={() => handleEditClick(event)}>
                  <CardEvents event={event} setIsAddModalOpen={setIsAddModalOpen} setCurrentDate={setCurrentDate} />
                </div>
              ))}
            </main>

          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="w-80">
          <DesktopSidebar currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </div>
      </div>

      <Modal 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={setIsAddModalOpen} 
        typeOperate={typeOperate} 
        currentDate={currentDate}
        selectedEvent={selectedEvent} 
      />

      {/* 🌟 Mobile Action Button (FAB) */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-dark-purple text-white rounded-2xl shadow-lg flex items-center justify-center text-2xl hover:bg-opacity-90 transition-all"
      >
        +
      </button>

      {/* 🌟 ตัวอย่างโครง Mobile Bottom Sheet (เปิดเมื่อกดปุ่ม + หรือ Filter) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden">
          <div className="w-full bg-light-main-background dark:bg-card rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-light-main dark:text-main">Filter Rooms</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            {/* โค้ดส่วน Filter เช็คบ็อกซ์ คล้ายๆ ของ Desktop */}
            <button className="w-full py-3 mt-6 bg-dark-purple text-white rounded-xl font-medium">
              Show Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
}