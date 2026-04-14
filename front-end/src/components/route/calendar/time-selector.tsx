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

const generateTimeSlots = (intervalMinutes: number = 30) => {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      if (h === 20 && m > 0) break; 
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
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
  const timeSlots = generateTimeSlots(intervalMinutes);

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