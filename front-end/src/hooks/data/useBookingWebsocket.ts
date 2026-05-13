import { ParsedBookingEvent } from '@/utils/interface/response';
import { useState, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAuthStore } from '@/stores/auth.store';
import { formatBookingEvent } from '@/lib/form';

export function useBookingWebSocket(roomNumber: number, startDate: string, endDate: string) {
  const [bookings, setBookings] = useState<ParsedBookingEvent[]>([]);
  const [isLoadingBooking, setIsLoadingBooking] = useState<boolean>(true);
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const url = process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET;
  const wsUrl = useMemo(() => (
    sessionToken && roomNumber && startDate && endDate 
    ? `${url as string}/booking/${roomNumber}?startDate=${startDate}&endDate=${endDate}` 
    : null
  ), [sessionToken, roomNumber, startDate, endDate, url]);

  const { sendMessage } = useWebSocket(
    wsUrl, 
    {
      onOpen: () => {
        console.log('WebSocket Connected!');
        sendMessage(JSON.stringify({
          type: 'auth',
          token: sessionToken
        }));
      },
      // 🌟 ย้ายตรรกะการจัดการข้อความมาไว้ที่นี่ เพื่อหลีกเลี่ยง Error react-hooks/set-state-in-effect
      onMessage: (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'initial_data':
              // แปลงข้อมูลทั้ง Array ก่อนเก็บลง State
              const formattedInitialData = (message.data || []).map(formatBookingEvent);
              setBookings(formattedInitialData); 
              setIsLoadingBooking(false);
              break;

            case 'booking_created':
              setBookings((prevBookings) => {
                const exists = prevBookings.some((b) => b.id === message.data.booking.id);
                if (exists) return prevBookings;
                
                // แปลงข้อมูล 1 ก้อนที่เพิ่งสร้าง ก่อนเอาไปต่อท้าย
                const newEvent = formatBookingEvent(message.data.booking);
                return [...prevBookings, newEvent];
              });
              break;

            case 'booking_updated':
              setBookings((prevBookings) => 
                prevBookings.map((booking) => 
                  booking.id === message.data.booking.id 
                    ? formatBookingEvent(message.data.booking) 
                    : booking
                )
              );
              break;

            case 'booking_end':
            case 'booking_noshow':
            case 'booking_deleted':
              setBookings((prevBookings) => 
                prevBookings.filter((booking) => booking.id !== message.data.booking.id)
              );
              break;

            default:
              console.warn("⚠️ Unknown message type:", message.type);
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      },
      shouldReconnect: () => true,
      reconnectAttempts: 20,
      reconnectInterval: 3000,
    }
  );

  // เมื่อเปลี่ยนเดือน/เปลี่ยนห้อง ให้ขึ้น Loading
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingBooking(true);
  }, [startDate, endDate, roomNumber]);

  // ระบบตรวจสอบและลบการจองที่สิ้นสุดเวลาแล้วทุก 30 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setBookings((prev) => {
        // 🌟 เทียบค่า b.endTime ตรงๆ ได้เลย เพราะมันถูกแปลงเป็น Date มาตั้งแต่ตอนรับข้อมูลแล้ว
        const filtered = prev.filter(b => b.endTime > now); 
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 30000); 

    return () => clearInterval(interval);
  }, []);

  return { bookings, isLoadingBooking };
}