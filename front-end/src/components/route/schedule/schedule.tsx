"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, subDays } from "date-fns";
import DesktopSidebar from "./desktopSidebar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Plus } from "lucide-react";
import CardEvents from "./eventCard";
import { BookingEvent } from "@/utils/interface/interface";
import { BookingEventResponse } from "@/utils/interface/response";
import { useMapResponseToEvents } from "@/hooks/data/ีuseMapRespToEvent";
import { bookingService } from "@/service/booking.service";

const mockResp: BookingEventResponse[] = [
  {
    id: "87faa1f6-543a-4f93-be6d-98daf40d73d3",
    startTime: "2026-02-16T04:30:00Z",
    endTime: "2026-02-16T05:30:00Z",
    title: "Business conference",
    passcode: "4979",
    status: "confirm",
    Room: {
      id: "abd444b7-b7e1-4167-984a-5c22ff01ad8e",
      name: "Room 1",
      roomNumber: 1
    },
    User: {
      id: "6d4ac759-dd57-4462-b980-4147b7d18cba",
      email: "guy.apisit2546@gmail.com",
      fullName: "นายอภิสิทธิ แขกเมือง"
    }
  },
  {
    id: "88b189db-2914-4d89-b00c-9aa16200f14c",
    startTime: "2026-02-16T07:30:00Z",
    endTime: "2026-02-16T08:30:00Z",
    title: "Business conference",
    passcode: "6568",
    status: "confirm",
    Room: {
      id: "abd444b7-b7e1-4167-984a-5c22ff01ad8e",
      name: "Room 1",
      roomNumber: 1
    },
    User: {
      id: "6d4ac759-dd57-4462-b980-4147b7d18cba",
      email: "guy.apisit2546@gmail.com",
      fullName: "นายอภิสิทธิ แขกเมือง"
    }
  }
]

// export const mockEvents: BookingEvent[] = [
//   // {
//   //   id: "1",
//   //   title: "VIP Private Luncheon",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: 1,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "2",
//   //   title: "VIP Private Luncheon",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "3",
//   //   title: "Tech Founders Meetup",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "4",
//   //   title: "Design Review: Project Velvet",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "5",
//   //   title: "Executive Board Meeting",
//   //   date: "2026-03-26T16:20:00+07:00",
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "6",
//   //   title: "VIP Private Luncheon",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "7",
//   //   title: "Tech Founders Meetup",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // },
//   // {
//   //   id: "8",
//   //   title: "Design Review: Project Velvet",
//   //   date: "2026-03-26T16:20:00+07:00", 
//   //   startTime: "09:00",
//   //   endTime: "11:00",
//   //   duration: "1 h 30 m",
//   //   room: undefined,
//   //   status: "Confirmed",
//   // }
// ];

export default function Schedule() {
  // State สำหรับเปิดปิด Mobile Modal (จำลอง)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | undefined>(undefined);
  const [events, setEvents] = useState<BookingEvent[] | undefined>(undefined)

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

  const fetchUserBookings = useCallback(async () => {
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    try {
      const data = await bookingService.fetchUserBookings(formattedDate);
      const formattedEvents = useMapResponseToEvents(data);
      setEvents(formattedEvents);
    } catch (error) {
      console.log('error: ', error);
    }
  }, [currentDate]); // 🌟 ฟังก์ชันนี้จะเปลี่ยนก็ต่อเมื่อ currentDate เปลี่ยนเท่านั้น

  useEffect(() => {
    if (isAddModalOpen) return
    setCurrentDate(new Date())
  }, [isAddModalOpen])

  useEffect(() => {
    // 1. จำลองการเรียก API (ของจริงเปลี่ยนเป็น axios.get(...))
    const fetchBookings = async () => {
      const apiResponse: BookingEventResponse[] = mockResp; // ข้อมูลที่ได้จาก DB
      
      // 2. โยนเข้าเครื่องแปลงข้อมูล!
      const formattedEvents = useMapResponseToEvents(apiResponse);
      console.log("events: ", formattedEvents)
      
      // 3. เอาไปแสดงผลได้เลย
      setEvents(formattedEvents);
    };

    fetchBookings();

    // fetchUserBookings();
  }, []);

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
              {events && events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} onClick={() => handleEditClick(event)}>
                    <CardEvents 
                      event={event} 
                      setIsAddModalOpen={setIsAddModalOpen} 
                      setCurrentDate={setCurrentDate} 
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-lg font-medium">No Content</p>
                  <p className="text-sm">You don't have any bookings for this day.</p>
                </div>
              )}
            </main>

          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="w-80">
          <DesktopSidebar currentDate={currentDate} setCurrentDate={setCurrentDate} events={events} />
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