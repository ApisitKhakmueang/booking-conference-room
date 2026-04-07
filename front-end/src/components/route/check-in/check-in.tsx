"use client";

import { useEffect, useMemo, useState } from "react";
import RealTimeClock from "./realtime-clock";
import { bookingService } from "@/service/booking.service";
import { RoomResp } from "@/utils/interface/response";
import Swal from "sweetalert2";
import QRCode from "react-qr-code";
import BookingCard from "./booking-card";
import Numpad from "./numpad";
import { BookingEvent, BookingStatus } from "@/utils/interface/interface";
import { mapBookingEvents } from "@/lib/map-resp-event";
import useBookingStatusByRoomIDWS from "@/hooks/data/useBookingStatusByRoomIDWS";

// const mapEvent:BookingEvent | undefined = 
// // undefined
// {
//   id: "evt-001",
//   title: "Business Strategy Sync",
//   date: "2026-04-06",
//   startTime: "2026-04-06T08:30:00.000Z",
//   endTime: "2026-04-06T09:30:00.000Z",
//   duration: "1 h",
//   room: {
//     id: "rm-01",
//     name: "Boardroom Alpha",
//     roomNumber: 401,
//   },
//   status: "Confirmed" as BookingStatus,
//   user: {
//     id: "usr-101",
//     email: "alexander.s@company.com",
//     fullName: "Alexander Sterling",
//     role: "Executive",
//   }
// }

export default function CheckIn({ roomNumber }: { roomNumber: string }) {
  const [roomData, setRoomData] = useState<RoomResp | null>(null);
  const { booking, isLoadingBooking } = useBookingStatusByRoomIDWS(roomData?.id)

  const fetchRoomData = async () => {
    try {
      const response = await bookingService.fetchRoomByRoomNumber(roomNumber);
      setRoomData(response);
    } catch (error: any) {
      // console.error("Error fetching room data:", error);
      if (error.response?.status === 404) {
        Swal.fire({
          title: 'Room Not Found',
          text: "Not found this room",
          icon: 'warning',
          confirmButtonColor: '#8370ff', 
        })
        return;
      }
      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#8370ff',
      });
    }
  }

  const mapEvent = useMemo(() => {
    if (!booking) return undefined
    return mapBookingEvents(booking)
  }, [booking])

  useEffect(() => {
    fetchRoomData()
  }, [])

  const bookingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/calendar`;

  return (
    // 🌟 เปลี่ยน bg-[#111111] เป็น bg-main-background
    <div className="min-h-screen bg-main-background flex flex-col items-center justify-center p-6 lg:p-12 font-sans">
      
      <div className="w-full max-w-5xl flex flex-col gap-16">
        
        {/* === 1. Header (ข้อมูลห้อง & เวลา) === */}
        <div className="w-full flex justify-between items-end">
          {roomData ? (
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-checkin tracking-tight">
                {roomData.name}
              </h1>
              <div className={`flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase ${mapEvent?.status === 'Confirmed' ? 'text-rose-400' : 'text-emerald-400'}`}>
                <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(180,149,255,0.6)] animate-pulse ${mapEvent?.status === 'Confirmed' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                {mapEvent?.status === 'Confirmed' ? 'Occupied' : 'Available'}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest pt-1">
                Capacity: {roomData.capacity} People
              </p>
            </div>
          ) : (
            /* 🌟 SKELETON LOADING STATE 🌟 */
            <div className="space-y-3 pb-1">
              {/* Skeleton สำหรับชื่อห้อง (h1) */}
              <div className="h-12 w-64 bg-white/10 rounded-xl animate-pulse"></div>
              
              {/* Skeleton สำหรับสถานะ (Available/Occupied) */}
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse"></div>
                <div className="h-4 w-24 bg-white/10 rounded-md animate-pulse"></div>
              </div>
              
              {/* Skeleton สำหรับ Capacity */}
              <div className="h-3 w-40 bg-white/10 rounded-md animate-pulse mt-2"></div>
            </div>
          )}

          <RealTimeClock />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-24 max-w-4xl mx-auto items-center">
          
          <div className="flex flex-col items-center lg:items-start w-full">
            <Numpad roomID={roomData?.id} />
          </div> 

          <div className="flex flex-col gap-8 w-full min-w-0 items-center lg:items-start">
            
            {mapEvent ? (
              <>
                <div className="flex flex-col gap-3 w-full">
                  <h2 className="text-xs font-bold tracking-[0.2em] text-checkin uppercase ml-2 flex items-center gap-2">
                    Current Meeting
                  </h2>
                  <BookingCard booking={mapEvent} />
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase ml-2">
                    Walk-in Booking
                  </h2>
                  {/* 🌟 เปลี่ยน bg-[#16171a] เป็น bg-sidebar */}
                  <div className="bg-sidebar border border-checkin/10 rounded-3xl p-5 shadow-lg flex items-center gap-6">
                    {/* 🌟 QR Code กล่องสีขาวเหมือนเดิมเป๊ะ */}
                    <div className="p-2.5 bg-white rounded-2xl shrink-0 shadow-inner">
                      <QRCode value={bookingUrl} size={80} level="H" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-bold text-lg tracking-wide">Scan to book</span>
                      <span className="text-gray-400 text-sm">Reserve your next slot instantly.</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6 opacity-80">
                 {/* 🌟 QR Code กล่องสีขาวเหมือนเดิมเป๊ะ */}
                 <div className="p-4 bg-white rounded-4xl shadow-[0_0_40px_rgba(180,149,255,0.15)]">
                   <QRCode value={bookingUrl} size={160} level="H" />
                 </div>
                 <div className="text-center space-y-2">
                   <h3 className="text-2xl font-bold text-white tracking-wide">Room Available</h3>
                   <p className="text-gray-400 text-sm max-w-[250px]">
                     Scan this QR code to book this room right now from your phone.
                   </p>
                 </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {isLoadingBooking && (
        <div className="absolute top-2 right-4 z-10 text-xs text-dark-purple flex items-center gap-1 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full shadow-md border border-gray-100 dark:border-white/10">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}
    </div>
  );
}