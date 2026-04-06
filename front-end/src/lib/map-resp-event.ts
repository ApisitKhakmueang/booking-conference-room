import { ArrangeRoom, BookingEvent, BookingStatus } from "@/utils/interface/interface";
import { BookingEventResponse } from "@/utils/interface/response";

const statusMap: Record<string, string> = {
  'confirm': 'Confirmed',
  'cancelled': 'Cancelled',
  'no_show' : 'No Show',
  'complete': 'Completed', 
};

// 🌟 1. แยกฟังก์ชันสำหรับแปลง "ค่าเดี่ยว (Single Object)" ออกมาก่อน
export const formatSingleBookingEvent = (resp: BookingEventResponse): BookingEvent => {
  const startDate = new Date(resp.startTime);
  const endDate = new Date(resp.endTime);

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  let durationStr = "";
  if (hours >= 2) {
    if (minutes > 0) durationStr = "Limit 2h"
    else durationStr = `${hours}h`
  } else if (hours > 0 && minutes > 0) {
    durationStr = `${hours} h ${minutes} m`;
  } else if (hours > 0) {
    durationStr = `${hours} h`;
  } else {
    durationStr = `${minutes} m`;
  }

  const formattedStatus = statusMap[resp.status] || 'Pending';

  let mappedRoom: ArrangeRoom | undefined = undefined;
  if (resp.Room) {
    mappedRoom = {
      id: resp.Room.id,
      name: resp.Room.name,
      roomNumber: resp.Room.roomNumber
    };
  }

  return {
    id: resp.id,
    title: resp.title,
    date: resp.startTime,
    startTime: resp.startTime,
    endTime: resp.endTime,
    duration: durationStr,
    room: mappedRoom,
    status: formattedStatus as BookingStatus,
    user: resp.User
  };
};

// 🌟 2. สร้าง Overload Types ให้ TypeScript รู้ว่า "ถ้าโยน Array มา จะได้ Array กลับไป"
export function mapBookingEvents(data: BookingEventResponse): BookingEvent;
export function mapBookingEvents(data: BookingEventResponse[]): BookingEvent[];

// 🌟 3. ฟังก์ชันหลักที่รับได้ทั้ง Array และ Object
export function mapBookingEvents(
  data: BookingEventResponse | BookingEventResponse[]
): BookingEvent | BookingEvent[] {
  // ถ้าข้อมูลที่ส่งมาเป็น Array ให้ใช้ .map() แล้วเรียกฟังก์ชันเดี่ยว
  if (Array.isArray(data)) {
    return data.map(formatSingleBookingEvent);
  }
  
  // ถ้าข้อมูลที่ส่งมาเป็น Object เดี่ยวๆ ให้แปลงแล้วคืนค่าเลย
  return formatSingleBookingEvent(data);
}