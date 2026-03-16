// ฟังก์ชันคำนวณระยะเวลา
export const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return ""; // ถ้ายังเลือกไม่ครบ ไม่ต้องคำนวณ

  // แยกชั่วโมงกับนาทีออกมา แล้วแปลงเป็นตัวเลข
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  // แปลงทุกอย่างให้เป็น "นาที" ให้หมด
  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  // หาความต่าง (End - Start)
  const diffMins = endTotalMins - startTotalMins;

  // ถ้าเวลาสิ้นสุด น้อยกว่าหรือเท่ากับ เวลาเริ่มต้น (เลือกเวลาผิด)
  if (diffMins <= 0) return "Invalid time"; 

  // แปลงกลับเป็น ชั่วโมง และ นาที
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  // จัดฟอร์แมตข้อความให้อ่านง่าย
  if (hours >= 2 && minutes > 0) return "Limit 2h"
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`; // เช่น 1h 30m
  if (hours > 0) return `${hours}h`; // เช่น 2h
  return `${minutes}m`; // เช่น 30m
};