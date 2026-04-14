import { BookingValidationParams } from '@/utils/interface/form';
import { differenceInCalendarDays } from 'date-fns';
import Swal from 'sweetalert2';

// utils/password-utils.ts
export const checkStrongPassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// แยกรายละเอียดเผื่ออยากใช้เช็คแยกข้อ
export const getPasswordCriteria = (password: string) => ({
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[@$!%*?&]/.test(password),
  hasLength: password.length >= 8,
});

export const validateBookingForm = ({ 
  startTime, 
  endTime, 
  duration, 
  date,
  maxAdvanceDays
}: BookingValidationParams): boolean => {

  // 1. เช็คว่ากรอกข้อมูลครบไหม
  if (!startTime || !endTime || !duration) {
    Swal.fire({
      title: 'Error',
      text: 'Please select time.',
      icon: 'error',
      timer: 2000
    });
    return false; // ส่ง false กลับไปเพื่อบอกว่าไม่ผ่าน
  }

  // 2. เช็คเวลาเริ่มต้น-สิ้นสุด
  if (startTime >= endTime) {
    Swal.fire({
      title: 'Error',
      text: 'Start time must be before end time.',
      icon: 'error',
      timer: 2000
    });
    return false;
  }

  // 3. เช็ควันที่จองล่วงหน้า
  if (date) {
    const limitDays = maxAdvanceDays || 30;
    const daysDifference = differenceInCalendarDays(new Date(date), new Date());
    
    if (daysDifference > limitDays) {
      Swal.fire({
        title: 'Error',
        text: `Cannot book more than ${maxAdvanceDays} days in advance`,
        icon: 'error',
        confirmButtonColor: '#8370ff',
        timer: 2000
      });
      return false;
    }

    if (daysDifference < 0) {
      Swal.fire({
        title: 'Error',
        text: 'Cannot book in the past.',
        icon: 'error',
        timer: 2000
      });
      return false;
    }
  }

  // 4. เช็คระยะเวลา (รองรับ String ที่ไดนามิกจากฟังก์ชัน formatSingleBookingEvent)
  if (duration.startsWith("Limit")) {
    Swal.fire({
      title: 'Booking Limit Exceeded',
      // นำ duration มาแสดงตรงๆ เช่น "Limit 2h 30m per booking."
      text: `${duration} per booking.`, 
      icon: 'error',
      confirmButtonColor: '#8370ff',
      timer: 2500 // อาจจะเพิ่มเวลาให้อ่านนิดนึง
    });
    return false;
  }

  // ถ้าผ่านทุกด่าน จะมาถึงบรรทัดนี้
  return true; 
};