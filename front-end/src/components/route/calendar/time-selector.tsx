// ไฟล์: components/ui/time-select.tsx
import { cn } from "@/lib/utils"
// 🌟 1. Import Select ของ Shadcn เข้ามา
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { bookingService } from "@/service/booking.service";
import { ConfigTimeResponse } from "@/utils/interface/response";

const generateTimeSlots = (
  intervalMinutes: number = 30,
  time: ConfigTimeResponse = {
    startTime: "08:00",
    endTime: "20:00"
  }
) => {
  const startHour = parseInt(time?.startTime.split(":")[0] || "8", 10);
  const startMinute = parseInt(time?.startTime.split(":")[1] || "0", 10);
  const endHour = parseInt(time?.endTime.split(":")[0] || "20", 10);
  const endMinute = parseInt(time?.endTime.split(":")[1] || "0", 10);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  const slots = [];
  for (
    let currentMinutes = startTotalMinutes; 
    currentMinutes <= endTotalMinutes; 
    currentMinutes += intervalMinutes
  ) {
    // 4. แปลงนาทีรวมกลับเป็นชั่วโมงและนาที
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;

    // เติม 0 ด้านหน้าถ้าเลขเป็นหลักเดียว (เช่น 8:0 -> 08:00)
    const hour = h.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');

    slots.push(`${hour}:${minute}`);
  }
  
  return slots;
};

// 🌟 2. ปรับ Interface ให้รับ Props แบบ Shadcn (ใช้ onValueChange แทน onChange)
export interface TimeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  intervalMinutes?: number;
  className?: string;
  placeholder?: string;
}

export function TimeSelect({
  value,
  onValueChange,
  intervalMinutes = 30,
  className,
  placeholder = "Select time..."
}: TimeSelectProps) {
  const [time, setTime] = useState<ConfigTimeResponse | undefined>(undefined)

  const fetchConfigTime = async () => {
    try {
      const response = await bookingService.fetchConfigTime();
      setTime(response)
    } catch (error:any) {
      if (error.response?.status === 500) {
        Swal.fire({
          title: 'Error',
          text: "Date format is invalid or missing",
          icon: 'warning',
          confirmButtonColor: '#b495ff', 
        })
        return;
      }

      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
    }
  }

  useEffect(() => {
    fetchConfigTime();
  }, [])

  const timeSlots = generateTimeSlots(intervalMinutes, time);

  const safeValue = value || "";

  return (
    // 🌟 3. ใช้โครงสร้างของ Shadcn UI
    <Select key={safeValue} value={safeValue} onValueChange={onValueChange}>
      <SelectTrigger className={cn(" w-full dark:bg-sidebar dark:border-sidebar dark:text-white", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      
      {/* สามารถปรับ max-h-[300px] เพื่อให้ Dropdown ไม่ยาวทะลุจอได้ครับ */}
      <SelectContent className="z-110 w-(--radix-select-trigger-width) dark:bg-sidebar dark:border-sidebar max-h-[250px] dark:text-white">
        {timeSlots.map((time) => (
          <SelectItem 
            key={time} 
            value={time}
            // Shadcn จะมีคลาส focus:bg-accent focus:text-accent-foreground จัดการ Hover ให้อัตโนมัติและสวยงามครับ
            className="cursor-pointer dark:focus:bg-hover dark:focus:text-white" 
          >
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}