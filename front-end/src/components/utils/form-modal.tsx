import { useEffect, useRef, useState } from "react";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import RoomSelector from "../route/calendar/room-selector";
import Swal from "sweetalert2"

import { TimeSelect } from "../route/calendar/time-selector";
import { calculateDuration } from "@/lib/time";
import { bodyBooking } from "@/lib/form";
import { ArrangeRoom, FormModalProps } from '@/utils/interface/interface';

// Component
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Calendar } from '../ui/calendar';
import { bookingService } from '@/service/booking.service';
import { validateBookingForm } from "@/lib/validation";
import { useSystemConfig } from "@/hooks/data/useSystemConfig";

export default function FormModal({ setIsAddModalOpen, typeOperate, rooms, currentDate, setCurrentDate, selectedEvent, onSuccess, preselectedRoomNumber }: FormModalProps) {
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
  const [calendarMonth, setCurrentMonth] = useState(currentDate);
  const { config, isLoadingConfig } = useSystemConfig();

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    const { startTime, endTime, duration, date } = formData
    const isValid = validateBookingForm({
      startTime,
      endTime,
      duration,
      date,
      maxAdvanceDays: config?.maxAdvanceDays
    });

    // 🌟 2. ถ้า Validator คืนค่า false (แปลว่ามี Error และ Swal เด้งไปแล้ว) 
    // ให้ return หยุดการทำงานของฟังก์ชันนี้ทันที
    if (!isValid) return;

    const finalTitle = titleRef.current?.value || `Booking ${selectedRoom?.name}`;
    const finalDataToSubmit = {
      ...formData,
      title: finalTitle
    };
    
    const body = bodyBooking(finalDataToSubmit)

    const bookingStartTime = new Date(body.startTime); // เวลาที่ผู้ใช้เลือกจอง
    const currentTime = new Date(); // เวลาปัจจุบันของเครื่อง

    if (bookingStartTime < currentTime) {
      Swal.fire({
        title: 'Error',
        text: 'Cannot book a time in the past.', // แจ้งเตือนว่าจองเวลาอดีตไม่ได้
        icon: 'error',
        timer: 2000
      });
      return; // หยุดการทำงาน ไม่ให้ยิง API
    }

    try {
      let result;
      if (typeOperate === 'add') {
        result = await bookingService.createBooking(selectedRoom?.roomNumber, body);
      } else {
        // สมมติว่าสร้างฟังก์ชัน updateBooking ไว้ใน service แล้ว
        // ต้องแนบ ID ของการจองที่จะแก้ไปด้วย (เช่น selectedEvent?.id)
        result = await bookingService.updateBooking(selectedEvent?.id, selectedRoom?.roomNumber, body); 
      }
      
      if (result.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Create booking successfully !',
          icon: 'success',
          timer: 2000
        })

        // 🌟 3. สั่งเปลี่ยนวันที่ในหน้าหลัก ให้ตรงกับวันที่เพิ่งกรอกในฟอร์มจอง!
        if (setCurrentDate) {
          setCurrentDate(formData.date);
        }

        if (onSuccess) {
          onSuccess();
        }
      }

      setFormData({...defaultFormData, date})
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
    } finally {
      setIsAddModalOpen(false);
    }
  }

  useEffect(() => {
    if (formData.date) {
      setCurrentMonth(formData.date);
    }
  }, [formData.date]);

  // 🌟 ใช้ useEffect เพื่อคำนวณ Duration อัตโนมัติ
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const newDuration = calculateDuration(formData.startTime, formData.endTime, config?.maxBookingMins);
      
      // อัปเดตค่า duration กลับเข้าไปใน formData
      setFormData((prev) => ({ ...prev, duration: newDuration }));
    }
  }, [formData.startTime, formData.endTime]); // <--- โค้ดจะทำงานก็ต่อเมื่อ 2 ตัวนี้เปลี่ยน

  useEffect(() => {
    // 🌟 1. ฟังก์ชันครอบจักรวาล: สกัดเอาเฉพาะ "HH:mm" ไม่ว่าข้อมูลจะมาหน้าตาแบบไหน
    const getSafeTime = (timeStr?: string) => {
      if (!timeStr) return "";
      try {
        // กรณีที่ 1: ถ้าเป็นรูปแบบเต็ม ISO (มีตัว T ขั้นกลาง เช่น "2026-03-28T08:30:00Z")
        if (timeStr.includes("T")) {
          return format(new Date(timeStr), "HH:mm");
        }
        // กรณีที่ 2: ถ้ามาเป็นข้อความเวลา (เช่น "8:30", "08:30:00", "08:30 AM")
        const parts = timeStr.split(":");
        if (parts.length >= 2) {
          const h = parts[0].trim().padStart(2, "0"); // ถ้าเป็น "8" จะถูกเติมศูนย์เป็น "08"
          const m = parts[1].trim().substring(0, 2);  // เอาแค่นาที 2 ตัวแรก
          return `${h}:${m}`;
        }
        return timeStr;
      } catch (e) {
        return "";
      }
    };

    if (typeOperate === 'update' && selectedEvent) {
      const foundRoom = rooms.find(r => r.name === selectedEvent.room?.name) || rooms[0];

      setFormData({
        title: selectedEvent.title,
        // เผื่อ selectedEvent.date เป็น undefined ให้ไปดึงวันที่จาก startTime แทน
        date: selectedEvent.date ? new Date(selectedEvent.date) : new Date(selectedEvent.startTime), 
        
        // 🌟 2. ใช้ฟังก์ชัน getSafeTime ทำความสะอาดข้อมูลก่อนยัดลง State
        startTime: getSafeTime(selectedEvent.startTime),
        endTime: getSafeTime(selectedEvent.endTime),
        
        duration: String(selectedEvent.duration),
        room: foundRoom
      });
      // อย่าลืมอัปเดต selectedRoom ให้ตรงกับในฟอร์มด้วย
      setSelectedRoom(foundRoom); 

    } else {
      // 🌟 2. โหมด Add: เอา preselectedRoomId มาหาห้อง
      // ใช้ String() ครอบเพื่อป้องกันบั๊ก Type ไม่ตรงกันเป๊ะๆ (เช่น 1 === "1")
      const targetRoom = preselectedRoomNumber 
        ? rooms.find(r => r.roomNumber === preselectedRoomNumber) || rooms[0]
        : rooms[0];

      // ยัดห้องที่เจอ (หรือห้องแรกถ้าไม่เจอ) ใส่เข้าไปเป็นค่าเริ่มต้น
      setFormData({
        ...defaultFormData,
        room: targetRoom
      });
      setSelectedRoom(targetRoom); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeOperate, selectedEvent, currentDate, preselectedRoomNumber]);

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e)
      }} 
      // 🌟 1. พื้นหลังฟอร์มใช้สีขาวล้วนในโหมดสว่าง (ลบ bg-light-purple ออก)
      className="relative bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-md transform transition-all border border-gray-100 dark:border-white/10 overflow-hidden">
      
      {/* 🌟 2. Modal Header: คลีนๆ พื้นขาว ขอบล่างเทา ตัวหนังสือสีเทาเข้ม */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-sidebar bg-light-purple dark:bg-sidebar/80">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {typeOperate === 'add' ? 'New Booking' : 'Update Booking'}
        </h2>
        <button 
          type="button"
          onClick={() => setIsAddModalOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5 p-1"
        >
          <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Modal Body (ส่วนฟอร์ม) */}
      <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">
          
          <div className="flex flex-col gap-4">
            {/* Title Input */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Title</label>
              <Input
                  id='title'
                  type="text"
                  ref={titleRef} 
                  // 🌟 3. Input: เพิ่ม Focus state สีม่วง
                  className="w-full px-3 py-2 border border-gray-200 focus:border-dark-purple focus:ring-1 focus:ring-dark-purple outline-none dark:border-sidebar rounded-lg dark:bg-sidebar dark:text-white text-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-sm" 
                  defaultValue={formData.title}
                  placeholder="Meeting with..."
                />
            </div>

            {/* Date Input */}
            <div className="flex flex-col gap-1.5">
              <label 
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
              <Input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-200 focus:border-dark-purple focus:ring-1 focus:ring-dark-purple outline-none dark:border-sidebar rounded-lg dark:bg-sidebar dark:text-white text-base font-light text-gray-800 shadow-sm [&::-webkit-calendar-picker-indicator]:hidden"
                value={format(formData.date || new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue) {
                    const newDate = new Date(inputValue);
                    setFormData(prev => ({ ...prev, date: newDate }));
                  }
                }}
                min={format(new Date(), 'yyyy-MM-dd')} 
              />
            </div>

            <div className="flex sm:flex-row flex-col items-stretch gap-4">
              {/* Calendar */}
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(d) => setFormData(prev => ({ ...prev, date: d as Date }))}
                month={calendarMonth} 
                onMonthChange={setCurrentMonth}
                // 🌟 4. Calendar: กรอบเทาอ่อน
                className="dark:bg-sidebar bg-white border border-gray-200 dark:border-white/10 rounded-lg p-3 shadow-sm"
                locale={enUS}
                disabled={(day) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); 
                  return day < today;
                }}
                required
                />

              <div className="flex flex-col gap-3 flex-1">
                {/* Start Time */}
                <div className="flex flex-col gap-1.5">
                  <label 
                    htmlFor="startTime"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Start Time</label>
                  <TimeSelect 
                    value={formData.startTime}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, startTime: val }))}
                    className="text-base border border-gray-200 shadow-sm rounded-lg"
                  />
                </div>

                {/* End Time */}
                <div className="flex flex-col gap-1.5">
                  <label 
                    htmlFor="endTime"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300">End Time</label>
                  <TimeSelect 
                    value={formData.endTime}
                    onValueChange={(val) =>  setFormData(prev => ({ ...prev, endTime: val }))}
                    className="text-base border border-gray-200 shadow-sm rounded-lg"
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label 
                    htmlFor="duration"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</label>
                  <Input
                      id='duration'
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-sidebar rounded-lg bg-gray-50 dark:bg-sidebar/80 dark:text-white text-gray-500 shadow-sm outline-none cursor-not-allowed" 
                      placeholder="Duration..."
                      value={formData.duration} 
                      readOnly
                    />
                </div>

                {/* Room */}
                <div className="flex flex-col gap-1.5">
                  <label 
                    htmlFor="room"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Room</label>
                  <RoomSelector 
                    className="px-3 py-2 dark:border-sidebar rounded-lg dark:bg-sidebar dark:text-white text-base border border-gray-200 shadow-sm"
                    selectedRoom={selectedRoom} 
                    setSelectedRoom={setSelectedRoom} 
                    rooms={rooms}  />
                </div>
              </div>
            </div>
          </div>
          
      </div>

      {/* 🌟 5. Modal Footer: พื้นหลังสีเทาอ่อน แยกโซนกับฟอร์มชัดเจน */}
      <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-sidebar bg-gray-50 dark:bg-sidebar/50">
        <Button 
          type="button"
          onClick={() => {
            setIsAddModalOpen(false)
            setFormData(defaultFormData)
          }}
          className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 dark:text-gray-300 dark:bg-transparent dark:border-sidebar dark:hover:bg-white/5 rounded-lg transition-colors shadow-sm"
          >
          Cancel
        </Button>

        {/* 🌟 6. ปุ่ม Confirm: เปลี่ยนจากสีน้ำเงินเป็นสีม่วง dark-purple แบรนด์ของคุณ */}
        <Button 
          type="submit" 
          className='px-5 py-2 text-sm font-semibold rounded-lg bg-dark-purple hover:bg-light-hover/90 dark:bg-dark-purple/90 dark:hover:bg-dark-purple text-white shadow-md transition-all'
        >
          {typeOperate === 'add' ? 'Confirm Booking' : 'Save Changes'}
        </Button>
      </div>

    </form>
  )
}