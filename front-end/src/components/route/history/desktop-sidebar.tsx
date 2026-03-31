import { useMemo } from "react"; // 🌟 เอา useState ออก
import { useRoomStore } from "@/stores/room.store";
import { useShallow } from "zustand/shallow";

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { DesktopSidebarHistoryProps } from "@/utils/interface/interface";
import { cn } from "@/lib/utils";
import OverviewCard from "./overview-card";

// 🌟 1. เพิ่ม selectedRooms และ setSelectedRooms เข้ามาใน Type ของ Props
export default function DesktopSidebar({
  events, 
  className,
  selectedRooms,
  setSelectedRooms 
}: DesktopSidebarHistoryProps) {
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

  // 🌟 2. ลบ const [selectedRooms, setSelectedRooms] ทิ้งไปเลย! (เพราะเรารับมาจาก Props แล้ว)

  // ฟังก์ชันนี้ยังอยู่เหมือนเดิม แต่มันจะไปอัปเดต State ที่หน้า Schedule ให้เอง
  const handleToggle = (value: number, isChecked: boolean | string) => {
    if (isChecked) {
      setSelectedRooms((prev) => [...prev, value])
    } else {
      setSelectedRooms((prev) => prev.filter((item) => item !== value))
    }
  }

  return (
    <aside className={cn(`flex flex-col space-y-8`, !className ? 'xl:block hidden border-l border-gray-100 dark:border-white/10 px-8 overflow-y-auto min-h-full' : className)}>
      {/* ... โค้ดปฏิทิน และการลูปห้อง เหมือนเดิมทุกประการ ไม่ต้องแก้อะไรในส่วนแสดงผล ... */}
      
      {/* (ตัวอย่างส่วนที่เรียกใช้) */}
      <div className="w-full">
        <div className="w-full space-y-6">
          <FieldGroup className="gap-6">
            <div className="flex items-center gap-8">
              <h4 className="text-sm font-bold text-gray-800 dark:text-stone-300 uppercase tracking-widest">Filter Rooms</h4>
              <h4 
                onClick={() => setSelectedRooms([])}
                className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 dark:text-stone-400 dark:hover:text-neutral-100 transition-colors whitespace-nowrap">Clear All</h4>
            </div>
            <div className="grid grid-rows-5 grid-flow-col gap-x-8 h-full gap-y-4">     
              {rooms.map((option) => (
                <Field key={option.id} orientation="horizontal" className="">
                  <Checkbox
                    id={option.id}
                    value={option.roomNumber}
                    checked={selectedRooms.includes(option.roomNumber)}
                    onCheckedChange={(checked) => handleToggle(option.roomNumber, checked)}
                    className="border-gray-300 data-[state=checked]:bg-dark-purple/50 dark:border-gray-600"
                  />
                  <FieldLabel htmlFor={option.id} className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 dark:text-stone-400 dark:hover:text-neutral-100 transition-colors whitespace-nowrap">
                    {option.name}
                  </FieldLabel>
                </Field>
              ))}
            </div>
          </FieldGroup>
        </div>
      </div>

      <OverviewCard events={events} />

    </aside>
  );
}