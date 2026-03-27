import { Calendar } from "@/components/ui/calendar";
import { useMemo, useState } from "react";
import { enUS } from 'date-fns/locale';
import { useRoomStore } from "@/stores/room.store";
import { useShallow } from "zustand/shallow";

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Card } from "@/components/ui/card";
import { BookingEvent } from "@/utils/interface/interface";
import { cn } from "@/lib/utils";

export default function DesktopSidebar({currentDate, setCurrentDate, events, className, }: {
  currentDate: Date,
  setCurrentDate: (date: Date) => void 
  events: BookingEvent[] | undefined
  className?: string
}) {
  const { rawRoom } = useRoomStore(
      useShallow(((state) => ({
        rawRoom: state.rooms
      })))
    )
    
    const rooms = useMemo(() => {
      if (!rawRoom) return [];
      return rawRoom
        .map((room) => ({
          id: room.id,
          name: room.name,
          roomNumber: room.roomNumber
        }))
        .sort((a, b) => a.roomNumber - b.roomNumber); 
    }, [rawRoom])

  const [selectedRooms, setSelectedRooms] = useState<number[]>([])

  const handleToggle = (value: number, isChecked: boolean | string) => {
    if (isChecked) {
      setSelectedRooms((prev) => [...prev, value])
    } else {
      setSelectedRooms((prev) => prev.filter((item) => item !== value))
    }
  }

  return (
    // 🌟 1. ลบขอบซ้าย (border-l) ที่ติดมาจาก Dark Mode ออก หรือเปลี่ยนเป็น border-gray-100 สำหรับ Light Mode
    // <aside className={cn(`flex flex-col space-y-8 fixed w-80 border-l border-gray-100 dark:border-white/10 h-full`, className)}>
    <aside className={cn(`flex flex-col space-y-8`, !className ? 'fixed w-80 border-l border-gray-100 dark:border-white/10 h-full px-8' : className)}>
      <div className="w-full">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(d) => setCurrentDate(d as Date)}
          className="dark:bg-sidebar rounded-md p-3"
          locale={enUS}
          disabled={(day) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            return day < today; 
          }}/>
      </div>

      <div className="w-full">
        <div className="w-full space-y-6">
          <FieldGroup className="gap-6">
            <h4 className="text-sm font-bold text-gray-800 dark:text-stone-300 uppercase tracking-widest">
              Filter Rooms
            </h4>
            
            <div className="grid grid-rows-5 grid-flow-col gap-x-8 h-full gap-y-4">     
              {rooms.map((option) => (
                <Field key={option.id} orientation="horizontal" className="">
                  <Checkbox
                    id={option.id}
                    value={option.roomNumber}
                    checked={selectedRooms.includes(option.roomNumber)}
                    onCheckedChange={(checked) => handleToggle(option.roomNumber, checked)}
                    // 🌟 2. ปรับสี Checkbox (ถ้า Component รองรับ className)
                    className="border-gray-300 data-[state=checked]:bg-dark-purple/50 dark:border-gray-600"
                  />
                  <FieldLabel 
                    htmlFor={option.id} 
                    // 🌟 3. ปรับสี Label ให้เป็นสีเทาเข้ม
                    className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 dark:text-stone-400 dark:hover:text-neutral-100 transition-colors whitespace-nowrap"
                  >
                    {option.name}
                  </FieldLabel>
                </Field>
              ))}
            </div>
          </FieldGroup>
        </div>
      </div>

      <div className="w-full xl:flex hidden">
        {/* 🌟 4. ปรับสี Card:
            - Light Mode: พื้นสีฟ้าอ่อนจัด (bg-blue-50) กรอบฟ้าอ่อน (border-blue-100) ตัวหนังสือสีฟ้าเข้ม (text-blue-900)
            - Dark Mode: ใช้สีม่วงเดิม (dark:bg-dark-purple dark:text-white) 
            หมายเหตุ: ถ้า `variant='dark-purple'` ของ Card component คุณมันบังคับคลาสสีไว้ คุณอาจจะต้องเปลี่ยนเป็น variant='outline' หรือค่าเริ่มต้น แล้วใช้ className ควบคุมแทนครับ
        */}
        <Card 
          loading={false} 
          className="py-0 border bg-light-sidebar border-dark-purple/30 shadow-sm dark:dark:bg-card dark:border-transparent dark:text-white duration-0 w-full"
        >
          <li className='flex flex-col gap-2 p-5'>
            <h1 className={`text-start font-semibold xl:text-2xl sm:text-xl text-lg text-dark-purple dark:text-white/90`}>
              Total Events
            </h1>

            {/* 🌟 ปรับสีตัวเลขให้เด่นขึ้น */}
            <p className="text-5xl font-bold text-center text-dark-purple dark:text-white py-2">
              {events?.length || 0}
            </p>

            <p className="text-end sm:text-xl text-lg text-dark-purple/80 dark:text-white/80 font-medium">Events</p>
          </li>
        </Card>
      </div>

    </aside>
  );
}