import { ArrangeRoom, BookingEvent, BookingStatus } from "@/utils/interface/interface";
import { BookingEventResponse } from "@/utils/interface/response";

export const useMapResponseToEvents = (responses: BookingEventResponse[]): BookingEvent[] => {
  return responses.map((resp) => {
    // 1. แปลงเวลา (ดึงเฉพาะ HH:mm ตามเวลา Local ของเครื่องผู้ใช้)
    const startDate = new Date(resp.startTime);
    const endDate = new Date(resp.endTime);

    // 2. คำนวณ Duration (ระยะเวลา)
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    let durationStr = "";
    if (hours >= 2) {
      if (minutes > 0) durationStr = "Limit 2h"
      else durationStr = `${hours}h`
    }
    if (hours > 0 && minutes > 0) durationStr = `${hours} h ${minutes} m`;
    else if (hours > 0) durationStr = `${hours} h`;
    else durationStr = `${minutes} m`;

    // 3. ปรับ Status ให้ตัวแรกเป็นพิมพ์ใหญ่ (Capitalize)
    // หรือถ้ามีหลายสถานะ สามารถใช้ Switch/Case หรือ Object Mapping ได้ครับ
    const formattedStatus = resp.status + "ed"

    let mappedRoom: ArrangeRoom | undefined = undefined;

    if (resp.Room) {
      mappedRoom = {
        id: resp.Room.id,
        name: resp.Room.name,
        roomNumber: resp.Room.roomNumber
      };
    }

    // 4. Return ประกอบร่างคืนเป็น BookingEvent
    return {
      id: resp.id,
      title: resp.title,
      date: resp.startTime, // เก็บ ISO String ตัวเดิมไว้ เผื่อเอาไป sort หรือแยกวัน
      startTime: resp.startTime,
      endTime: resp.endTime,
      duration: durationStr,
      room: mappedRoom, // ดึงชื่อห้องออกมา ถ้าไม่มีจะได้ undefined
      status: formattedStatus as BookingStatus,
    };
  });
};