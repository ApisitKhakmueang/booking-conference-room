import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import {
  format,
  startOfDay,
} from 'date-fns';
import RoomSelector from "../route/calendar/roomSelector";
import Swal from "sweetalert2"

import { TimeSelect } from "../route/calendar/timeSelector";
import { calculateDuration } from "@/utils/time";
import { bodyBooking } from "@/utils/form";
import { ArrangeRoom, FormModalProps } from '@/utils/interface/interface';

// Component
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Calendar } from '../ui/calendar';
import axios from 'axios';

export default function FormModal({ setIsAddModalOpen, typeOperate, rooms, currentDate }: FormModalProps) {
  const defaultFormData = {
    title: "",
    date: currentDate,
    startTime: "",
    endTime: "",
    duration: "",
    room: rooms[0]
  }
  const titleRef = useRef<HTMLInputElement>(null)
  const [selectedRoom, setSelectedRoom] = useState<ArrangeRoom | undefined>(rooms[0]);
  const [formData, setFormData] = useState(defaultFormData)
  // const [isOpenCalendar, setIsOpenCalendar] = useState(false)

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { id, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [id]: value }));
  // };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    const { startTime, endTime, duration } = formData

    if (!startTime || !endTime || !duration) {
      Swal.fire({
        title: 'Error',
        text: 'Please select time.',
        icon: 'error',
        timer: 2000
      })
      return
    }

    if (startTime >= endTime) {
      Swal.fire({
        title: 'Error',
        text: 'Start time must be before end time.', // *เติมคำว่า be ให้แกรมม่าเป๊ะขึ้น
        icon: 'error',
        timer: 2000
      });
      return;
    }

    const finalTitle = titleRef.current?.value || `Booking ${selectedRoom?.name}`;
    const finalDataToSubmit = {
      ...formData,
      title: finalTitle
    };
    
    const body = bodyBooking(finalDataToSubmit)

    const url = process.env.NEXT_PUBLIC_BACKEND_HTTP;

    try {
      const result = await axios.post(`${url}/booking/6d4ac759-dd57-4462-b980-4147b7d18cba?room=${selectedRoom?.roomNumber}`, body)
      
      if (result.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Create booking successfully !',
          icon: 'success',
          timer: 2000
        })
      }

      setFormData(defaultFormData)
      if (titleRef.current) {
        titleRef.current.value = "";
      }
    } catch(error: any) {
      Swal.fire({
        title: 'Error',
        text: 'Scheduling conflict',
        icon: 'error',
        timer: 2000
      })
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

  // useEffect(() => {
  //   if (rooms.length > 0 && !selectedRoom) {
  //     setSelectedRoom(rooms[0]);
  //     // setIsLoadingRoom(false)
  //   }
  // }, [rooms, selectedRoom]);

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e)
      }} 
      className="relative bg-light-purple dark:bg-card rounded-lg shadow-xl w-full max-w-md transform transition-all">
      
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-sidebar bg-dark-purple dark:bg-sidebar/80">
        <h3 className="flex gap-2 items-center text-lg font-bold text-white">
          <CalendarIcon />
          {typeOperate === 'add' ? 'New' : 'Update'} Booking
        </h3>
        <button 
          onClick={() => setIsAddModalOpen(false)}
          className="text-white dark:text-gray-400 hover:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          {/* ไอคอนกากบาท (X) หรือใช้คำว่า Close ก็ได้ */}
          <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Modal Body (ส่วนฟอร์ม) */}
      <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">
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
                  className="w-full px-3 py-1.5 border dark:border-sidebar rounded-md dark:bg-sidebar dark:text-white text-gray-700 placeholder:dark:text-gray-700/60" 
                  defaultValue={formData.title}
                  placeholder="Meeting with..."
                />
            </div>

            <div className="flex flex-col gap-1">
              <label 
                className="block font-medium text-gray-700 dark:text-gray-300">Date</label>
              <Input 
                type="text"
                className="flex justify-between items-center w-full px-3 py-1.5 border dark:border-sidebar rounded-md dark:bg-sidebar/80 dark:text-white text-base font-light text-gray-700"
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

            <div className="flex sm:flex-row flex-col items-stretch gap-2">
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
                    className="text-base border border-gray-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    htmlFor="endTime"
                    className="block font-medium text-gray-700 dark:text-gray-300">End Time</label>
                  <TimeSelect 
                    value={formData.endTime}
                    onValueChange={(val) =>  setFormData(prev => ({ ...prev, endTime: val }))}
                    className="text-base border border-gray-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    htmlFor="duration"
                    className="block font-medium text-gray-700 dark:text-gray-300">Duration</label>
                  <Input
                      id='duration'
                      type="text" 
                      className="w-full px-3 py-1.5 dark:border-sidebar rounded-md dark:bg-sidebar/80 dark:text-white text-gray-700" placeholder="Duration..."
                      value={formData.duration} // ผูกค่า
                      readOnly
                    />
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    htmlFor="room"
                    className="block font-medium text-gray-700 dark:text-gray-300">Room</label>
                  <RoomSelector 
                    className="px-3 py-1.5 dark:border-sidebar rounded-md dark:bg-sidebar dark:text-white text-base border border-gray-300"
                    selectedRoom={selectedRoom} 
                    setSelectedRoom={setSelectedRoom} 
                    rooms={rooms}  />
                </div>
              </div>
            </div>
          </div>
          
      </div>

      {/* Modal Footer (ปุ่มกดยืนยัน) */}
      <div className="px-6 py-4 flex justify-end gap-3 border-t dark:border-sidebar bg-light-purple dark:bg-sidebar/50">
        <Button 
          type="button"
          onClick={() => {
            setIsAddModalOpen(false)
            setFormData(defaultFormData)
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
  )
}