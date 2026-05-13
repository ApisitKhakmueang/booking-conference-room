import { ParsedBookingEvent } from '@/utils/interface/response';
import { useState, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAuthStore } from '@/stores/auth.store';
import { formatBookingEvent } from '@/lib/form';

// 🌟 1. แก้ไขรับค่าเป็น String ธรรมดา ไม่ต้องใส่ { }
export default function useBookingStatusByRoomIDWS(roomID: string | undefined) {
  const [booking, setBooking] = useState<ParsedBookingEvent | undefined>(undefined);
  const [isLoadingBooking, setIsLoadingBooking] = useState<boolean>(true);
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const wsUrl = useMemo(() => {
    return sessionToken && roomID ? `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET}/room/${roomID}` : null;
  }, [sessionToken, roomID]);

  useWebSocket(
    wsUrl, 
    {
      onMessage: (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'initial_data':
              // 🌟 2. ดักจับกรณีส่งค่า null มา หรือไม่มีคนจอง
              if (!message.data) {
                setBooking(undefined);
              } else {
                // ดักจับกรณีเป็น Array (ถ้า backend ส่ง array มา ให้ดึงตัวแรกที่กำลังใช้อยู่)
                // แต่ถ้าส่งมาเป็น Object อยู่แล้ว ก็ format ได้เลย
                const rawData = Array.isArray(message.data) ? message.data[0] : message.data;
                
                if (rawData) {
                  setBooking(formatBookingEvent(rawData));
                } else {
                  setBooking(undefined); // ถ้า array ว่างเปล่า []
                }
              }
              setIsLoadingBooking(false);
              break;

            case 'booking_start':
              // 🌟 3. ต้อง formatBookingEvent ให้เหมือน initial_data ด้วย
              if (message.data && message.data.booking) {
                setBooking(formatBookingEvent(message.data.booking));
              }
              break;

            case 'booking_end':
            case 'booking_noshow': // ยุบรวมเคสที่ผลลัพธ์เหมือนกันได้เลย
              setBooking(undefined);
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

  // === ล้างคิวอัตโนมัติเมื่อหมดเวลา ===
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setBooking((prev) => {
        if (!prev) return undefined;
        return prev.endTime > now ? prev : undefined;
      });
    }, 30000); // เช็คทุก 30 วินาที

    return () => clearInterval(interval);
  }, []);

  return { booking, isLoadingBooking };
}