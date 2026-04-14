'use client';

import { bookingService } from '@/service/booking.service';
import { useAuthStore } from '@/stores/auth.store';
import { BookingEventResponse, ConfigTimeResponse, RoomResp } from '@/utils/interface/response';
import { format, parseISO, differenceInMinutes, startOfDay, addHours } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import useSWR from 'swr';

interface RoomTimelineProps {
  rooms: RoomResp[];
}

const START_HOUR = 8;
const TOTAL_HOURS = 12;

const generateTimeSlots = (
  time: ConfigTimeResponse= {
    startTime: "08:00",
    endTime: "20:00"
  }
) => {
  const startHour = parseInt(time?.startTime.split(":")[0] || "8", 10);
  const startMinute = parseInt(time?.startTime.split(":")[1] || "0", 10);
  const endHour = parseInt(time?.endTime.split(":")[0] || "20", 10);
  const endMinute = parseInt(time?.endTime.split(":")[1] || "0", 10);

  const startTotalHours = Math.floor((startHour * 60 + startMinute) / 60);
  const endTotalHours = Math.ceil((endHour * 60 + endMinute) / 60);
  const totalHours = endTotalHours - startTotalHours;

  const slots = [];
  const baseDate = startOfDay(new Date());
  for (let i = 0; i < totalHours; i++) {
    slots.push(format(addHours(baseDate, startTotalHours + i), "hh:mm a"));
  }
  return slots;
};

const calculatePosition = (startTimeIso: string, endTimeIso: string) => {
  const start = parseISO(startTimeIso);
  const end = parseISO(endTimeIso);
  
  const startHour = start.getHours() + (start.getMinutes() / 60);
  const durationMinutes = differenceInMinutes(end, start);
  const durationHours = durationMinutes / 60;

  const left = Math.max(0, ((startHour - START_HOUR) / TOTAL_HOURS) * 100);
  const width = (durationHours / TOTAL_HOURS) * 100;

  return { left: `${left}%`, width: `${width}%` };
};

export default function RoomTimeline({ rooms }: RoomTimelineProps) {
  const user = useAuthStore((state) => state.user);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const [time, setTime] = useState<ConfigTimeResponse | undefined>(undefined)
  const timeSlots = generateTimeSlots(time);
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);
  
  // 🌟 1. เพิ่ม State สำหรับเก็บ ID ของกล่องที่กำลังถูกคลิกให้ขยาย
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchConfigTime = async () => {
    try {
      const response = await bookingService.fetchConfigTime();
      setTime(response)
    } catch (error:any) {
      if (error.response?.status === 500) {
        Swal.fire({
          title: 'Error',
          text: "Date format is invalid or missing",
          icon: 'warning',
          confirmButtonColor: '#b495ff', 
        })
        return;
      }

      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
    }
  }

  useEffect(() => {
    fetchConfigTime();
  }, [])

  const { data: bookings, error, isLoading } = useSWR(
    ['bookings', todayStr], 
    ([, dateStr]) => bookingService.fetchAllBookingsByDate(dateStr), 
    {
      refreshInterval: 60000,
      revalidateOnFocus: true, 
    }
  );

  useEffect(() => {
    const updateTimeLine = () => {
      const now = new Date();
      const currentHour = now.getHours() + (now.getMinutes() / 60);
      if (currentHour >= START_HOUR && currentHour <= START_HOUR + TOTAL_HOURS) {
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

  return (
    <div className="flex flex-col gap-6 w-full h-full text-sm pb-6">
      <div className="bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-xl overflow-x-auto no-scrollbar shadow-xl relative">
        <div className="min-w-[1200px]"> 
          
          <div className="flex border-b border-gray-200 dark:border-white/10 text-xs font-medium text-light-secondary dark:text-gray-500 py-3">
            <div className="md:w-48 w-30 shrink-0 px-6 uppercase tracking-wider text-[10px] flex items-center">
              Meeting Rooms
            </div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, minmax(0, 1fr))` }}>
              {timeSlots.map((time, idx) => (
                <div key={idx} className="text-center border-l border-gray-200 dark:border-white/5 first:border-l-0 text-[10px]">
                  {time}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {currentTimePos !== null && (
              <div className="absolute inset-0 flex pointer-events-none z-30">
                <div className="md:w-48 w-30 shrink-0"></div>
                <div className="flex-1 relative">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-danger dark:bg-rose-500 shadow-[0_0_10px_rgba(255,107,107,0.4)] dark:shadow-[0_0_10px_rgba(243,24,96,0.6)]" 
                    style={{ left: `${currentTimePos}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-danger dark:bg-rose-500 shadow-md"></div>
                  </div>
                </div>
              </div>
            )}

            {rooms.map((room) => (
              <div key={room.id} className="flex border-b border-gray-200 dark:border-white/5 hover:bg-light-purple dark:hover:bg-white/2 transition-colors group h-20">
                
                <div className="md:w-48 w-30 shrink-0 px-6 flex flex-col justify-center border-r border-gray-200 dark:border-white/5 bg-light-main-background dark:bg-card z-20 transition-colors">
                  <span className="text-light-main dark:text-white font-medium">{room.name}</span>
                  <span className="text-[10px] text-light-secondary dark:text-gray-500 truncate">Capacity: {room.capacity}</span>
                </div>
                
                <div className="flex-1 relative">
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timeSlots.length}, minmax(0, 1fr))` }}>
                    {timeSlots.map((_, idx) => (
                      <div key={idx} className="border-l border-gray-200 dark:border-white/5 first:border-l-0 h-full"></div>
                    ))}
                  </div>

                  {bookings
                    ?.filter(booking => booking.Room.id === room.id && booking.status === 'confirm')
                    .map((booking, _) => {
                      const { left, width } = calculatePosition(booking.startTime, booking.endTime);
                      
                      const isMyBooking = booking.User?.id === user?.id;
                      const bookingBgClass = isMyBooking 
                        ? 'bg-dark-purple dark:bg-checkin' 
                        : 'bg-warning dark:bg-orange-500';

                      // 🌟 2. เช็คว่ากล่องนี้คือกล่องที่กำลังถูกคลิกอยู่หรือไม่
                      const isExpanded = expandedId === booking.id;

                      return (
                        <div 
                          key={booking.id}
                          // 🌟 3. เมื่อคลิก ให้สลับสถานะ (ถ้าขยายอยู่ให้หด, ถ้าหดอยู่ให้ขยาย)
                          onClick={(e) => {
                            e.stopPropagation(); // ป้องกันไม่ให้การคลิกทะลุไปถึงพื้นหลัง
                            setExpandedId(isExpanded ? null : booking.id);
                          }}
                          // 🌟 4. ปรับ className ให้ฉลาดขึ้น
                          className={`absolute top-1/2 -translate-y-1/2 h-15 rounded-lg px-3 py-1 flex flex-col justify-center cursor-pointer transition-all duration-300 ease-out shadow-md overflow-hidden text-white ${bookingBgClass} ${
                            isExpanded 
                              ? 'min-w-40 scale-[1.02] brightness-110 z-50' // ถ้ากำลังขยายอยู่ (Click) ให้ใส่คลาสพวกนี้ค้างไว้เลย
                              : 'min-w-0 z-10 hover:min-w-40 hover:scale-[1.02] hover:brightness-110 hover:z-50' // ถ้ายังไม่คลิก ก็ให้ทำงานเฉพาะตอน Hover ตามเดิม
                          }`}
                          style={{ left, width }}
                          title={`${booking.title}\nBy: ${booking.User?.fullName}\nTime: ${format(parseISO(booking.startTime), "HH:mm")} - ${format(parseISO(booking.endTime), "HH:mm")}`}
                        >
                          <span className="font-semibold text-xs truncate drop-shadow-sm">{booking.title || "Meeting"}</span>
                          <span className="text-[10px] opacity-90 drop-shadow-sm truncate">
                            {format(parseISO(booking.startTime), "HH:mm")} - {format(parseISO(booking.endTime), "HH:mm")}
                          </span>
                          <span className="text-[10px] opacity-90 drop-shadow-sm truncate">
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