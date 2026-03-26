import { Calendar } from "@/components/ui/calendar";
import { useMemo, useState } from "react";
import { enUS } from 'date-fns/locale';
import { useRoomStore } from "@/stores/room.store";
import { useShallow } from "zustand/shallow";

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Card } from "@/components/ui/card";
import { BookingEvent } from "@/utils/interface/interface";

export default function DesktopSidebar({currentDate, setCurrentDate, events}: {
  currentDate: Date,
  setCurrentDate: (date: Date) => void 
  events: BookingEvent[] | undefined
}) {
  const { rawRoom } = useRoomStore(
      useShallow(((state) => ({
        rawRoom: state.rooms
      })))
    )
    
    const rooms = useMemo(() => {
      // ดักไว้ก่อนว่าถ้าไม่มีข้อมูล ให้ return array เปล่าๆ ออกไป
      if (!rawRoom) return [];
  
      // 🌟 แปลงร่างด้วย .map() และต่อด้วย .sort() ได้เลย
      return rawRoom
        .map((room) => ({
          id: room.id,
          name: room.name,
          roomNumber: room.roomNumber
        }))
        .sort((a, b) => a.roomNumber - b.roomNumber); // เรียงน้อยไปมาก
    }, [rawRoom])

  const [selectedRooms, setSelectedRooms] = useState<number[]>([])

  // 3. ฟังก์ชันจัดการเมื่อ Checkbox ถูกกด
  // หมายเหตุ: Checkbox ของ Shadcn/Radix UI มักจะส่งค่า checked กลับมาเป็น boolean หรือ "indeterminate"
  const handleToggle = (value: number, isChecked: boolean | string) => {
    if (isChecked) {
      // ถ้าติ๊กถูก -> เอาค่าเก่ามา แล้วต่อด้วยค่าใหม่
      setSelectedRooms((prev) => [...prev, value])
    } else {
      // ถ้าเอาติ๊กออก -> กรองค่าที่ตรงกับที่กดออกไป
      setSelectedRooms((prev) => prev.filter((item) => item !== value))
    }
  }

  return (
    <aside className="fixed w-80 border-l border-white/10 px-8 space-y-10 h-full">
      <div>
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(d) => setCurrentDate(d as Date)}
          className="dark:bg-sidebar rounded-md p-3"
          locale={enUS}
          
          // 🌟 เพิ่มเงื่อนไข disabled ตรงนี้ครับ!
          disabled={(day) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาให้เป็นเที่ยงคืน จะได้เทียบแค่วันที่
            return day < today; // ถ้าวันนั้นน้อยกว่าวันนี้ ให้ปิดการใช้งาน
          }}/>
      </div>

      <div>
        {/* <h4 className="text-sm font-bold text-stone-300 mb-4 uppercase tracking-widest">Filter Rooms</h4> */}
        <div className="mx-auto w-64 space-y-6">
          <FieldGroup className="gap-6">
            <h4 className="text-sm font-bold text-black dark:text-stone-300 uppercase tracking-widest">
              Filter Rooms
            </h4>
            
            {/* 4. ใช้ .map() วนลูปสร้าง Checkbox ตามจำนวน Options */}
            <div className="grid grid-rows-5 grid-flow-col gap-x-8 gap-y-4">     
              {rooms.map((option) => (
                <Field key={option.id} orientation="horizontal" className="">
                  <Checkbox
                    id={option.id}
                    value={option.roomNumber}
                    // เช็คว่าค่า value นี้อยู่ใน Array state ของเราไหม ถ้าอยู่ให้ติ๊กถูก
                    checked={selectedRooms.includes(option.roomNumber)}
                    // ใช้ onCheckedChange (ถ้าเป็น Component ของ Shadcn/Radix UI)
                    // ถ้าเป็น Checkbox HTML ปกติ ให้ใช้ onChange={(e) => handleToggle(option.value, e.target.checked)}
                    onCheckedChange={(checked) => handleToggle(option.roomNumber, checked)}
                  />
                  <FieldLabel 
                    htmlFor={option.id} 
                    className="cursor-pointer text-sm text-black hover:text-black/80 dark:text-stone-400 dark:hover:text-neutral-100 transition-colors"
                  >
                    {option.name}
                  </FieldLabel>
                </Field>
              ))}
            </div>
          </FieldGroup>

          {/* ส่วนนี้เอาไว้ดูค่า State แบบ Real-time ตอนทดสอบครับ (ลบทิ้งได้เลยตอนใช้งานจริง) */}
          {/* <div className="mt-4 p-4 bg-neutral-900 rounded-md text-xs text-stone-400">
            <p className="font-bold mb-2 text-white">Selected Values:</p>
            <pre>{JSON.stringify(selectedRooms, null, 2)}</pre>
          </div> */}
        </div>
      </div>

      <div className="w-full">
        <Card variant='dark-purple' loading={false} className="py-0">
          <li className='flex flex-col gap-2 p-5'>
            <h1 className={`text-start font-semibold xl:text-2xl sm:text-xl text-lg`}>
              Total Events
            </h1>

            <p className="text-5xl font-semibold text-center">
              {events?.length || 0}
            </p>

            <p className="text-end sm:text-xl text-lg">Events</p>
          </li>
        </Card>
      </div>

      {/* <div className="p-6 rounded-2xl bg-neutral-900 border-t border-white/5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
        
        <h4 className="text-xs font-bold text-stone-500 mb-4 uppercase tracking-widest relative z-10">Quick Stats</h4>
        <div className="space-y-6 relative z-10">
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Total Bookings Today</p>
            <p className="text-3xl font-black text-neutral-100">12</p>
          </div>
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Busiest Room</p>
            <p className="text-lg font-bold text-purple-400">Conference A</p>
            <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
              <div className="w-3/4 h-full bg-purple-500"></div>
            </div>
          </div>
        </div>
      </div> */}

    </aside>
  );
}