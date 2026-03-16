import { ModalProps } from "@/utils/interface/interface";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "./calendar";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import {
  format,
  startOfDay,
} from 'date-fns';
import RoomSelector from "../route/calendar/roomSelector";
import { useRoomStore } from "@/stores/room.store";
import { useShallow } from "zustand/shallow";
import { TimeSelect } from "../route/calendar/timeSelector";
import { calculateDuration } from "@/utils/time";
import { bodyBooking } from "@/utils/form";
// import { ChevronDown, ChevronUp } from "lucide-react";

export interface ArrangeRoom {
  id: string
  name: string
  roomNumber: number
}

export default function Modal({ isAddModalOpen, setIsAddModalOpen }: ModalProps) {
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

  const titleRef = useRef<HTMLInputElement>(null)
  const [selectedRoom, setSelectedRoom] = useState<ArrangeRoom | undefined>(undefined);
  const [formData, setFormData] = useState({
    title: "",
    date: startOfDay(new Date()),
    startTime: "",
    endTime: "",
    duration: "",
    room: rooms[0]
  })
  // const [isOpenCalendar, setIsOpenCalendar] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e:React.FormEvent) => {
    try {
      e.preventDefault()
      setFormData(prev => ({
        ...prev,
        title: titleRef.current?.value || `Booking ${formData.room.name}`
      }))
      const body = bodyBooking(formData)
      console.log("body: ", body)
    } catch(error) {
      console.log(error)
    }
  }

  // 🌟 ใช้ useEffect เพื่อคำนวณ Duration อัตโนมัติ
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const newDuration = calculateDuration(formData.startTime, formData.endTime);
      
      // อัปเดตค่า duration กลับเข้าไปใน formData
      setFormData((prev) => ({ ...prev, duration: newDuration }));
    }
  }, [formData.startTime, formData.endTime]); // <--- โค้ดจะทำงานก็ต่อเมื่อ 2 ตัวนี้เปลี่ยน

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
      // setIsLoadingRoom(false)
    }
  }, [rooms, selectedRoom]);

  return (
    <>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          
          {/* 1. Backdrop (พื้นหลังเบลอและมืดลง) */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddModalOpen(false)} // กดพื้นที่ว่างเพื่อปิด
          ></div>

          {/* 2. Modal Box (กล่องตรงกลาง) */}
          <form
            onSubmit={(e) => {
              handleSubmit(e)
              // setIsAddModalOpen(false)
            }} 
            className="relative bg-white dark:bg-card rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-sidebar bg-gray-50 dark:bg-sidebar/80">
              <h3 className="flex gap-2 items-center text-lg font-bold text-gray-900 dark:text-white">
                <CalendarIcon />
                New Booking
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {/* ไอคอนกากบาท (X) หรือใช้คำว่า Close ก็ได้ */}
                <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body (ส่วนฟอร์ม) */}
            <div className="px-6 py-6 space-y-4">
               {/* ใส่ฟอร์มของคุณตรงนี้ เช่น Input ชื่อ, เลือกเวลา */}
               {/* <p className="text-gray-500 dark:text-gray-400 text-sm">
                 ฟอร์มกรอกข้อมูลการจองจะมาอยู่ตรงนี้...
               </p> */}
               
               <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label 
                      htmlFor="title"
                      className="block font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <Input
                        id='title'
                        type="text"
                        ref={titleRef} 
                        className="w-full px-3 py-1.5 border dark:border-sidebar rounded-md dark:bg-sidebar dark:text-white" 
                        defaultValue={formData.title}
                        placeholder="Meeting with..."
                      />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label 
                      className="block font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <Input 
                      type="text"
                      className="flex justify-between items-center w-full px-3 py-1.5 border dark:border-sidebar rounded-md dark:bg-sidebar/80 dark:text-white text-base font-light"
                      value={format(formData.date || new Date(), 'd MMMM yyyy')}
                      readOnly
                      // onClick={() => setIsOpenCalendar(true)}
                      >
                      {/* <span>
                        {format(formData.date || new Date(), 'd MMMM yyyy')} 
                      </span> */}
                      {/* { isOpenCalendar ? <ChevronUp /> : <ChevronDown /> } */}
                    </Input>
                  </div>

                  <div className="flex items-stretch gap-2">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(d) => setFormData(prev => ({ ...prev, date: d as Date }))}
                      className="dark:bg-sidebar rounded-md p-3"
                      
                      // 🌟 เพิ่มเงื่อนไข disabled ตรงนี้ครับ!
                      disabled={(day) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาให้เป็นเที่ยงคืน จะได้เทียบแค่วันที่
                        return day < today; // ถ้าวันนั้นน้อยกว่าวันนี้ ให้ปิดการใช้งาน
                      }}/>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <label 
                          htmlFor="startTime"
                          className="block font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                        <TimeSelect 
                          value={formData.startTime}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, startTime: val }))}
                          className="text-base"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label 
                          htmlFor="endTime"
                          className="block font-medium text-gray-700 dark:text-gray-300">End Time</label>
                        <TimeSelect 
                          value={formData.endTime}
                          onValueChange={(val) =>  setFormData(prev => ({ ...prev, endTime: val }))}
                          className="text-base"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label 
                          htmlFor="duration"
                          className="block font-medium text-gray-700 dark:text-gray-300">Duration</label>
                        <Input
                            id='duration'
                            type="text" 
                            className="w-full px-3 py-1.5 border dark:border-sidebar rounded-md dark:bg-sidebar/80 dark:text-white" placeholder="Duration..."
                            value={formData.duration} // ผูกค่า
                            readOnly
                          />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label 
                          htmlFor="room"
                          className="block font-medium text-gray-700 dark:text-gray-300">Room</label>
                        <RoomSelector 
                          className="px-3 py-1.5 dark:border-sidebar rounded-md dark:bg-sidebar dark:text-white border-none text-base"
                          selectedRoom={selectedRoom} 
                          setSelectedRoom={setSelectedRoom} 
                          rooms={rooms}  />
                      </div>
                    </div>
                  </div>
               </div>
               
            </div>

            {/* Modal Footer (ปุ่มกดยืนยัน) */}
            <div className="px-6 py-4 flex justify-end gap-3 border-t dark:border-sidebar bg-gray-50 dark:bg-sidebar/50">
              <Button 
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  // setIsOpenCalendar(false)
                }}
                variant="transparent"
                >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="blue"
                >
                Confirm Booking
              </Button>
            </div>

          </form>
        </div>
      )}
    </>
  )
}