'use client'

import RoomsGrid from "./room-grid";
import RoomStatus from "./room-status";
import useBookingStatusWS from "@/hooks/data/useBookingStatusWS";
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RoomResp } from '@/utils/interface/response';

export default function Room() {
  const [isLoading, setIsLoading] = useState(false);
  // 🌟 1. เปลี่ยนชื่อ State เพื่อให้รู้ว่านี่คือ "ข้อมูลดิบ" จาก Database
  const [rawRooms, setRawRooms] = useState<RoomResp[]>([]);
  
  const { bookings, isLoadingBooking } = useBookingStatusWS();

  const fetchRoom = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_BACKEND_HTTP;
    try {
      setIsLoading(true);
      const response = await axios.get(`${url as string}/room/details`);
      setRawRooms(response.data); // เก็บข้อมูลดิบลง State
    } catch(error) {
      console.log('error: ', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // 🌟 2. ใช้ useMemo ผสมร่างข้อมูลแทนการใช้ useEffect -> setRoom
  // มันจะคำนวณใหม่ให้อัตโนมัติ เฉพาะตอนที่ rawRooms หรือ bookings มีการเปลี่ยนแปลงเท่านั้น
  const displayRooms:RoomResp[] = useMemo(() => {
    if (!rawRooms || rawRooms.length === 0) return [];

    return rawRooms.map((room) => {
      // 2.1 เช็คสถานะปิดปรับปรุงก่อน
      if (room.isActive === 'maintenance') {
        return { ...room, status: 'maintenance' };
      }

      // 2.2 ถ้ายังไม่มี bookings (หรือโหลดไม่เสร็จ) ให้ถือว่าห้องว่างไปก่อน
      if (!bookings || bookings.length === 0) {
        return { ...room, status: 'available' };
      }

      // 2.3 หา booking ที่ตรงกับห้องนี้
      const activeBooking = bookings.find(
        (booking) => booking.Room.id === room.id
      );

      // 2.4 ผสมสถานะลงไปแล้ว Return กลับ
      if (activeBooking) {
        return {
          ...room,
          status: activeBooking.status === 'confirm' ? 'occupied' : 'available',
        };
      }

      // 2.5 ถ้าไม่เจอใน bookings แปลว่าห้องว่าง
      return { ...room, status: 'available' };
    });
  }, [rawRooms, bookings]); // คำนวณใหม่เมื่อสองตัวนี้เปลี่ยน

  return (
    <>
      <RoomStatus displayRooms={displayRooms} />
      <RoomsGrid displayRooms={displayRooms} />
    </>
  )
}