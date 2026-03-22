"use client";

import { useState } from "react";
import DesktopSidebar from "./desktopSidebar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface BookingEvent {
  id: string;
  title: string;
  description: string;
  startTime: string; // เก็บแค่เวลาเพื่อความง่ายในการโชว์
  startAmpm: string;
  endTime: string,
  endAmpm: string
  room: string;
  status: 'Confirmed' | 'Pending';
  duration: number; // นาที
  // ข้อมูลเกี่ยวกับ guests อาจจะต้องปรับ structure ตามความเหมาะสม
  guestsCount?: number; 
}

export const mockEvents: BookingEvent[] = [
  {
    id: "1",
    title: "Executive Board Meeting",
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

export default function Booking() {
  // State สำหรับเปิดปิด Mobile Modal (จำลอง)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="bg-light-main-background dark:bg-main-background flex">
      
      {/* 🌟 สมมติว่าด้านซ้ายสุดเป็น Sidebar หลักของระบบคุณ (ที่มีเมนู Calendar, Rooms) */}
      {/* <MainSystemSidebar /> */}

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="shrink-0">
            <p className="text-2xl">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex">
            
            {/* Main List Scrollable */}
            <main className="flex-1 space-y-4 overflow-y-auto p-4 md:p-8 no-scrollbar">
              {mockEvents.map((event) => (
                <div 
                  key={event.id}
                  className="group flex gap-6 p-6 rounded-2xl dark:bg-sidebar dark:hover:bg-hover transition-all duration-300">
                  <div className="w-20 pt-1 text-right border-r border-white/10 pr-6">
                    <span className="block font-bold text-lg text-neutral-100">{event.startTime}</span>
                    <span className="block text-[12px] text-stone-500 uppercase">{event.startAmpm}</span>
                    <span className="block text-[10px] text-stone-500 uppercase">to</span>
                    <span className="block font-bold text-lg text-neutral-100">{event.endTime}</span>
                    <span className="block text-[12px] text-stone-500 uppercase">{event.endAmpm}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">{event.room}</span>

                      <Button className="p-1.5 bg-transparent dark:hover:bg-hover hover:text-gray-500">
                        <X />
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-100 mb-1">{event.title}</h3>
                    {/* <p className="text-sm text-stone-400">{event.description}</p> */}
                    <div className="mt-4 flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-purple-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> {event.status}
                      </span>
                      <span className="text-stone-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span> {event.duration} mins
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </main>

          </div>
        </div>

        <div>
          {/* Desktop Right Sidebar */}
          <DesktopSidebar />
        </div>
      </div>

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