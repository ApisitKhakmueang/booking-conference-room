'use client';

import { BookingEventResponse, RoomResp } from '@/utils/interface/response';
import { format, parseISO, differenceInMinutes, startOfDay, addHours } from 'date-fns';
import { useEffect, useState } from 'react';

interface RoomTimelineProps {
  rooms: RoomResp[];
  bookings: BookingEventResponse[] | null;
}

// 🌟 ตั้งค่าเวลาเริ่มและจบการทำงาน (08:00 - 20:00)
const START_HOUR = 8;
const TOTAL_HOURS = 12; // 20 - 8 = 12 ชั่วโมง

// สร้าง Array สำหรับหัวตารางเวลา 
// เราต้องการแค่ 08:00 ถึง 19:00 (รวม 12 ช่อง) เพราะ 20:00 คือจุดสิ้นสุด ไม่ต้องโชว์เป็นช่องใหม่
const generateTimeSlots = () => {
  const slots = [];
  const baseDate = startOfDay(new Date());
  for (let i = 0; i < TOTAL_HOURS; i++) {
    slots.push(format(addHours(baseDate, START_HOUR + i), "hh:mm a"));
  }
  return slots;
};

// ฟังก์ชันคำนวณตำแหน่งและความกว้างของกล่องการจอง
const calculatePosition = (startTimeIso: string, endTimeIso: string) => {
  const start = parseISO(startTimeIso);
  const end = parseISO(endTimeIso);
  
  const startHour = start.getHours() + (start.getMinutes() / 60);
  const durationMinutes = differenceInMinutes(end, start);
  const durationHours = durationMinutes / 60;

  // 🌟 หารด้วย TOTAL_HOURS เพื่อให้เทียบสัดส่วนกับ 12 ช่อง (ตั้งแต่ 08:00-20:00)
  const left = Math.max(0, ((startHour - START_HOUR) / TOTAL_HOURS) * 100);
  const width = (durationHours / TOTAL_HOURS) * 100;

  return { 
    left: `${left}%`, 
    width: `${width}%` 
  };
};

const generateMockBookings = (rooms: RoomResp[]): BookingEventResponse[] => {
  if (!rooms || rooms.length === 0) return [];
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // จำลองข้อมูล User 4 คน
  const mockUsers = [
    { id: 'usr-101', fullName: 'Alexander Sterling', email: 'alexander.s@company.com' },
    { id: 'usr-102', fullName: 'Sarah Connor', email: 'sarah.c@company.com' },
    { id: 'usr-103', fullName: 'Michael Chen', email: 'michael.c@company.com' },
    { id: 'usr-104', fullName: 'Emily Davis', email: 'emily.d@company.com' },
  ];

  return [
    { id: 'mock-1', Room: { id: rooms[0]?.id }, title: 'Quarterly Review', startTime: `${todayStr}T09:00:00`, endTime: `${todayStr}T11:30:00`, status: 'confirm', User: mockUsers[0] } as any,
    { id: 'mock-2', Room: { id: rooms[1]?.id }, title: 'Design Sprint', startTime: `${todayStr}T10:00:00`, endTime: `${todayStr}T12:00:00`, status: 'confirm', User: mockUsers[1] } as any,
    { id: 'mock-3', Room: { id: rooms[1]?.id }, title: 'Client Pitch', startTime: `${todayStr}T14:00:00`, endTime: `${todayStr}T15:30:00`, status: 'confirm', User: mockUsers[2] } as any,
    { id: 'mock-4', Room: { id: rooms[2]?.id }, title: 'Daily Standup', startTime: `${todayStr}T08:30:00`, endTime: `${todayStr}T09:00:00`, status: 'confirm', User: mockUsers[3] } as any,
    { id: 'mock-5', Room: { id: rooms[3]?.id }, title: 'Town Hall', startTime: `${todayStr}T13:00:00`, endTime: `${todayStr}T16:00:00`, status: 'confirm', User: mockUsers[0] } as any,
    { id: 'mock-6', Room: { id: rooms[5]?.id }, title: 'Interview: Frontend', startTime: `${todayStr}T11:00:00`, endTime: `${todayStr}T12:00:00`, status: 'confirm', User: mockUsers[1] } as any,
    { id: 'mock-7', Room: { id: rooms[7]?.id }, title: 'Budget Planning', startTime: `${todayStr}T15:00:00`, endTime: `${todayStr}T17:00:00`, status: 'confirm', User: mockUsers[2] } as any,
    { id: 'mock-8', Room: { id: rooms[8]?.id }, title: 'Evening Sync', startTime: `${todayStr}T18:00:00`, endTime: `${todayStr}T19:30:00`, status: 'confirm', User: mockUsers[3] } as any,
  ];
};

export default function RoomTimeline({ rooms, bookings }: RoomTimelineProps) {
  const timeSlots = generateTimeSlots();
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);

  useEffect(() => {
    const updateTimeLine = () => {
      const now = new Date();
      const currentHour = now.getHours() + (now.getMinutes() / 60);
      if (currentHour >= START_HOUR && currentHour <= START_HOUR + TOTAL_HOURS) {
        // 🌟 คำนวณเส้นเวลาปัจจุบันด้วย TOTAL_HOURS (12)
        const pos = ((currentHour - START_HOUR) / TOTAL_HOURS) * 100;
        setCurrentTimePos(pos);
      } else {
        setCurrentTimePos(null); 
      }
    };
    updateTimeLine(); 
    const interval = setInterval(updateTimeLine, 60000); 
    return () => clearInterval(interval);
  }, []);

  const displayBookings = (bookings && bookings.length > 0) ? bookings : generateMockBookings(rooms);

  const colors = [
    "bg-checkin text-white", 
    "bg-sidebar text-white border border-checkin/30", 
    "bg-[#8370ff] text-white", 
    "bg-white/10 text-gray-300 border border-white/5" 
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full text-sm py-4">
      <div className="bg-card border border-white/5 rounded-xl overflow-x-auto no-scrollbar shadow-xl relative">
        <div className="min-w-[1200px]"> 
          
          {/* แถวหัวข้อเวลา (Time Headers) */}
          <div className="flex border-b border-white/10 text-xs font-medium text-gray-500 py-3">
            <div className="w-48 shrink-0 px-6 uppercase tracking-wider text-[10px] flex items-center">
              Meeting Rooms
            </div>
            {/* 🌟 บังคับ Header ให้เป็น CSS Grid คอลัมน์เท่าจำนวน timeSlots */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, minmax(0, 1fr))` }}>
              {timeSlots.map((time, idx) => (
                <div key={idx} className="text-center border-l border-white/5 first:border-l-0 text-[10px]">
                  {time}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {currentTimePos !== null && (
              <div className="absolute inset-0 flex pointer-events-none z-30">
                <div className="w-48 shrink-0"></div>
                <div className="flex-1 relative">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_10px_rgba(243,24,96,0.6)]" 
                    style={{ left: `${currentTimePos}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(243,24,96,0.8)]"></div>
                  </div>
                </div>
              </div>
            )}

            {rooms.map((room) => (
              <div key={room.id} className="flex border-b border-white/5 hover:bg-white/2 transition-colors group h-20">
                
                <div className="w-48 shrink-0 px-6 flex flex-col justify-center border-r border-white/5 bg-card z-20">
                  <span className="text-white font-medium">{room.name}</span>
                  <span className="text-[10px] text-gray-500 truncate">Capacity: {room.capacity}</span>
                </div>
                
                <div className="flex-1 relative">
                  {/* 🌟 บังคับตารางข้างล่างให้เป็น CSS Grid คอลัมน์เท่าจำนวน timeSlots เป๊ะๆ เหมือนข้างบน */}
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, minmax(0, 1fr))` }}>
                    {timeSlots.map((_, idx) => (
                      <div key={idx} className="border-l border-white/5 first:border-l-0 h-full"></div>
                    ))}
                  </div>

                  {displayBookings
                    ?.filter(booking => booking.Room.id === room.id && booking.status === 'confirm')
                    .map((booking, index) => {
                      const { left, width } = calculatePosition(booking.startTime, booking.endTime);
                      const colorClass = colors[index % colors.length];

                      return (
                        <div 
                          key={booking.id}
                          // 🌟 สิ่งที่เปลี่ยน: เพิ่ม min-w-0, duration-300, ease-out, hover:z-50 และ overflow-hidden
                          className={`absolute top-1/2 -translate-y-1/2 h-15 rounded-lg px-3 py-1 flex flex-col justify-center cursor-pointer hover:scale-[1.02] hover:brightness-125 min-w-0 hover:min-w-40 transition-all duration-300 ease-out z-10 hover:z-50 shadow-md overflow-hidden ${colorClass}`}
                          style={{ left, width }}
                          title={`${booking.title}\nBy: ${booking.User?.fullName}\nTime: ${format(parseISO(booking.startTime), "HH:mm")} - ${format(parseISO(booking.endTime), "HH:mm")}`}
                        >
                          <span className="font-semibold text-xs truncate drop-shadow-sm">{booking.title || "Meeting"}</span>
                          <span className="text-[10px] opacity-80 drop-shadow-sm truncate">
                            {format(parseISO(booking.startTime), "HH:mm")} - {format(parseISO(booking.endTime), "HH:mm")}
                          </span>
                          <span className="text-[10px] opacity-80 drop-shadow-sm truncate">
                            By: {booking.User?.fullName}
                          </span>
                        </div>
                      )
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}