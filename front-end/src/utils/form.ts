import { add, format, startOfDay } from "date-fns"; // 🌟 แน่ใจว่า import startOfDay มาแล้ว
import { BodyBooking } from "./interface/form";

export const bodyBooking = (formData: BodyBooking) => {
  const start = formData.startTime;
  const end = formData.endTime;
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  // 🌟 1. ล้างเวลาปัจจุบันให้เป็น 00:00:00 ก่อน
  const baseDate = startOfDay(formData.date); 

  // 🌟 2. เอา baseDate (ที่สะอาดแล้ว) มาบวกชั่วโมงและนาที
  const startTime = add(baseDate, {
    hours: startHour,
    minutes: startMin
  });
  
  const endTime = add(baseDate, {
    hours: endHour,
    minutes: endMin
  });

  return {
    title: formData.title,
    // 🌟 ผลลัพธ์จะออกมาเป็น YYYY-MM-DDT08:00:00+07:00 เป๊ะๆ แน่นอนครับ
    startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }
}