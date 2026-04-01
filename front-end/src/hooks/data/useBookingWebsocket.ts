import { BookingEventResponse } from '@/utils/interface/response';
import { useState, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAuthStore } from '@/stores/auth.store';
import { formatBookingEvent } from '@/lib/form';

export function useBookingWebSocket(roomNumber: number, startDate: string, endDate: string) {
  const [bookings, setBookings] = useState<BookingEventResponse[]>([]);
  const [isLoadingBooking, setIsLoadingBooking] = useState<boolean>(true);
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const url = process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET;
  const wsUrl = useMemo(() => (
    sessionToken && roomNumber && startDate && endDate 
    ? `${url as string}/booking/${roomNumber}?startDate=${startDate}&endDate=${endDate}` 
    : null
  ), [sessionToken, roomNumber, startDate, endDate]);

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

  // เมื่อเปลี่ยนเดือน/เปลี่ยนห้อง ให้ขึ้น Loading แต่ "ไม่ต้องเซ็ต bookings เป็น []"
  // ปล่อยของเก่าค้างไว้ก่อน พอของใหม่มาค่อยทับ จะได้ไม่กระพริบ
  useEffect(() => {
    setIsLoadingBooking(true);
  }, [startDate, endDate, roomNumber]);

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

        case 'booking_created':
          setBookings((prevBookings) => {
            const exists = prevBookings.some((b) => b.id === message.data.booking.id);
            if (exists) return prevBookings;
            
            // 🌟 3. แปลงข้อมูล 1 ก้อนที่เพิ่งสร้าง ก่อนเอาไปต่อท้าย
            const newEvent = formatBookingEvent(message.data.booking);
            return [...prevBookings, newEvent];
          });
          break;

        case 'booking_updated':
          setBookings((prevBookings) => 
            prevBookings.map((booking) => 
              // 🌟 4. แปลงข้อมูลก้อนที่ถูกอัปเดต
              booking.id === message.data.booking.id 
                ? formatBookingEvent(message.data.booking) 
                : booking
            )
          );
          break;

        case 'booking_deleted':
          setBookings((prevBookings) => 
            prevBookings.filter((booking) => booking.id !== message.data.booking.id)
          );
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

  // const isConnected = readyState === ReadyState.OPEN;

  return { bookings, isLoadingBooking };
}