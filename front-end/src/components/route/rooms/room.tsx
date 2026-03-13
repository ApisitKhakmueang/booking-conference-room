'use client'

import RoomsGrid from "./room-grid";
import RoomStatus from "./room-status";
import useBookingStatusWS from "@/hooks/data/useBookingStatusWS";
import axios from 'axios';
import { useMemo, useState } from 'react';
import { RoomResp } from '@/utils/interface/response';
import { useShallow } from "zustand/shallow";
import { useRoomStore } from "@/stores/room.store";

export default function Room() {
  // 🌟 1. เปลี่ยนชื่อ State เพื่อให้รู้ว่านี่คือ "ข้อมูลดิบ" จาก Database
  
  const { bookings, isLoadingBooking } = useBookingStatusWS();

  const { rawRoom } = useRoomStore(
    useShallow(((state) => ({
      rawRoom: state.rooms
    })))
  )

  // 🌟 2. ใช้ useMemo ผสมร่างข้อมูลแทนการใช้ useEffect -> setRoom
  // มันจะคำนวณใหม่ให้อัตโนมัติ เฉพาะตอนที่ rawRooms หรือ bookings มีการเปลี่ยนแปลงเท่านั้น
  const displayRooms:RoomResp[] = useMemo(() => {
    if (!rawRoom || rawRoom.length === 0) return [];

    return rawRoom.map((room) => {
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
  }, [rawRoom, bookings]); // คำนวณใหม่เมื่อสองตัวนี้เปลี่ยน

  return (
    <>
      <RoomStatus displayRooms={displayRooms} isLoadingBooking={isLoadingBooking} />
      <RoomsGrid displayRooms={displayRooms} />
    </>
  )
}