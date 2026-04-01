import { BookingEventResponse } from '@/utils/interface/response';
import { useState, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAuthStore } from '@/stores/auth.store';
import { formatBookingEvent } from '@/lib/form';

export default function useBookingStatusWS() {
  const [bookings, setBookings] = useState<BookingEventResponse[]>([]);
  const [isLoadingBooking, setIsLoadingBooking] = useState<boolean>(true);
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const wsUrl = useMemo(() => {
    return sessionToken ? `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET}/booking/status` : null;
  }, [sessionToken]);

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(
    wsUrl, 
    {
      onOpen: () => {
        console.log('WebSocket Connected!');
        sendMessage(JSON.stringify({
          type: 'auth',
          token: sessionToken
        }));
      },
      shouldReconnect: () => true,
      reconnectAttempts: 20,
      reconnectInterval: 3000,
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setBookings((prev) => {
        const filtered = prev.filter(b => {
          const endTime = new Date(b.endTime); // แปลงเป็น Date Object
          
          return endTime > now
        });
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 30000); // เช็คทุก 30 วินาที

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      const message = lastJsonMessage as any; 

      switch (message.type) {
        case 'initial_data':
          // 🌟 2. แปลงข้อมูลทั้ง Array ก่อน set ลง State
          const formattedInitialData = (message.data || []).map(formatBookingEvent);
          setBookings(formattedInitialData); 
          setIsLoadingBooking(false);
          break;

        case 'booking_start':
          setBookings((prevBookings) => {
            const exists = prevBookings.some((b) => b.id === message.data.booking.id);
            if (exists) return prevBookings;
            
            // 🌟 3. แปลงข้อมูล 1 ก้อนที่เพิ่งสร้าง ก่อนเอาไปต่อท้าย
            const newEvent = formatBookingEvent(message.data.booking);
            return [...prevBookings, newEvent];
          });
          break;

        case 'booking_end':
          setBookings((prevBookings) => 
            prevBookings.filter((booking) => booking.id !== message.data.booking.id)
          );
          break;

        default:
          console.warn("⚠️ Unknown message type:", message.type);
      }
    }
  }, [lastJsonMessage]);

  return { bookings, isLoadingBooking };
}