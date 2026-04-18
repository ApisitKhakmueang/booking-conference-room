import { CardProps } from "@/components/ui/card";
import { BookingEventResponse, RoomResponse } from "@/utils/interface/response";

export function BookingStatus(rooms: RoomResponse[]) {
  const total = rooms.length
  const available = rooms.filter((room) => room.status === 'available').length
  const occupied = rooms.filter((room) => room.status === 'occupied').length
  const maintenance = rooms.filter((room) => room.status === 'maintenance').length

  const result: { name: string, amount: number, variant: CardProps["variant"] }[] = [
    { name: 'Total', amount: total, variant: 'purple' },
    { name: 'Available', amount: available, variant: 'purple' },
    { name: 'Occupied', amount: occupied, variant: 'purple' },
    { name: 'Maintainance', amount: maintenance, variant: 'purple' },
  ];
  return result;
}

export function DisplayRooms(rooms: RoomResponse[] | undefined, bookings: BookingEventResponse[]) {
  if (!rooms || rooms.length === 0) return [];

  return rooms.map((room) => {
    // 2.1 เช็คสถานะปิดปรับปรุงก่อน
    if (room.status === 'maintenance') {
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
  }).sort((a, b) => a.roomNumber - b.roomNumber);
}