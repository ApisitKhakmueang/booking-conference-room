import { ArrangeRoom, BookingEvent, BookingStatus } from "@/utils/interface/interface";
import { BookingEventResponse, ConfigResponse } from "@/utils/interface/response";

const statusMap: Record<string, string> = {
  'confirm': 'Confirmed',
  'cancelled': 'Cancelled',
  'no_show' : 'No Show',
  'complete': 'Completed', 
};

// 🌟 1. แยกฟังก์ชันสำหรับแปลง "ค่าเดี่ยว (Single Object)" ออกมาก่อน
export const formatSingleBookingEvent = (
  resp: BookingEventResponse, 
  config?: ConfigResponse // หรือใส่ Interface ของ Config ที่คุณมี
): BookingEvent => {
  const startDate = new Date(resp.startTime);
  const endDate = new Date(resp.endTime);

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  // 🌟 ใช้ค่าจาก config แทนการใส่เลข 200000 หรือ 2 (ชั่วโมง)
  // สมมติใน config ของคุณคือหน่วยนาที เช่น 120 นาที (2 ชม.)
  const maxMins = config?.maxBookingMins || 120; 
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  let durationStr = "";
  
  // 🌟 1. เช็คว่าเวลาจอง (diffMins) เกินขีดจำกัด (maxMins) หรือไม่
  if (diffMins > maxMins) {
    // 🌟 2. คำนวณชั่วโมงและนาทีจาก "ขีดจำกัด (maxMins)"
    const limitHours = Math.floor(maxMins / 60);
    const limitMinutes = maxMins % 60;

    // 🌟 3. สร้างข้อความ Limit ให้ฉลาดขึ้น
    if (limitHours > 0 && limitMinutes > 0) {
      durationStr = `Limit ${limitHours}h ${limitMinutes}m`;
    } else if (limitHours > 0) {
      durationStr = `Limit ${limitHours}h`;
    } else {
      durationStr = `Limit ${limitMinutes}m`;
    }
    
  } else {
    // กรณีที่ไม่ได้เกินขีดจำกัด ให้แสดงเวลาจองปกติ
    if (hours > 0 && minutes > 0) {
      durationStr = `${hours} h ${minutes} m`;
    } else if (hours > 0) {
      durationStr = `${hours} h`;
    } else {
      durationStr = `${minutes} m`;
    }
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
    passcode: resp.passcode,
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
export function mapBookingEvents(data: BookingEventResponse, config?: ConfigResponse): BookingEvent;
export function mapBookingEvents(data: BookingEventResponse[], config?: ConfigResponse): BookingEvent[];

// 🌟 3. ฟังก์ชันหลักที่รับได้ทั้ง Array และ Object
export function mapBookingEvents(
  data: BookingEventResponse | BookingEventResponse[],
  config?: ConfigResponse
): BookingEvent | BookingEvent[] {
  if (Array.isArray(data)) {
    return data.map((item) => formatSingleBookingEvent(item, config));
  }
  return formatSingleBookingEvent(data, config);
}