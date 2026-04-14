import { Button } from "@/components/ui/button";
import { bookingService } from "@/service/booking.service";
import { EventCardScheduleProps } from "@/utils/interface/interface";
import { formatTimeWithSuffix } from "@/lib/time";
import { format } from "date-fns";
import { Key, X } from "lucide-react";
import Swal from "sweetalert2";

export default function CardEvents({ event, setIsAddModalOpen, setCurrentDate, onDeleteSuccess } : EventCardScheduleProps) {
  const eventDate = new Date(event.date)
  const formattedDate = event.date ? format(eventDate, 'EEEE, d MMM yyyy') : '';
  const start = formatTimeWithSuffix(event.startTime)
  const end = formatTimeWithSuffix(event.endTime)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // สำคัญมาก! ป้องกันไม่ให้การคลิกทะลุไปเปิด Modal แก้ไข

    const bookingStartTime = new Date(eventDate); // เวลาที่เริ่มจอง
    const currentTime = new Date(); // เวลาปัจจุบันของเครื่อง

    // 🌟 คำนวณหาความห่างของเวลา (ผลลัพธ์เป็นมิลลิวินาที)
    const timeDifference = bookingStartTime.getTime() - currentTime.getTime();
    
    // 1 ชั่วโมง = 60 นาที * 60 วินาที * 1000 มิลลิวินาที = 3,600,000 มิลลิวินาที
    // const oneHourInMs = 60 * 60 * 1000;

    if (timeDifference <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'Cannot delete an ongoing or past booking.', // แปล: ไม่สามารถลบการจองที่กำลังใช้งานหรือผ่านไปแล้วได้
        icon: 'error',
        timer: 2000
      });
      return; 
    }

    // 🌟 2. ดักจับกรณี: "ยังไม่ถึงเวลาจอง แต่เหลือน้อยกว่า 1 ชั่วโมง"
    // if (timeDifference < oneHourInMs) {
    //   Swal.fire({
    //     title: 'Error',
    //     text: 'Please operate at least 1 hour in advance.',
    //     icon: 'error',
    //     timer: 2000
    //   });
    //   return; 
    // }

    // ถามเพื่อความแน่ใจก่อนลบ
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#8370ff',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        const result = await bookingService.deleteBooking(event.id);
        
        // 🌟 1. เปลี่ยนจาก === 200 เป็นเงื่อนไขที่ครอบคลุมความสำเร็จทั้งหมด (200-299)
        // เพราะบาง API สั่ง Delete สำเร็จจะตอบ 204 No Content
        if (result.status >= 200 && result.status < 300) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your booking has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          // 🌟 2. เพิ่ม setTimeout หน่วงเวลาสักนิด (เช่น 300ms) 
          // เพื่อให้ชัวร์ว่า Database ฝั่ง Backend ลบข้อมูลเสร็จแล้วจริงๆ ก่อนที่เราจะขอข้อมูลใหม่
          if (onDeleteSuccess) {
            setTimeout(() => {
              onDeleteSuccess();
            }, 100); // 0.3 วินาที (เร็วพอที่ผู้ใช้จะไม่รู้สึกว่าช้า แต่มากพอให้ DB ลบเสร็จ)
          }
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete booking', 'error');
      }
    }
  };

  return (
    <div 
      onClick={() => {
        setIsAddModalOpen(true)
        setCurrentDate(eventDate)
      }}
      className="group flex gap-6 md:p-6 p-4 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 cursor-pointer"
    >
      
      {/* 🌟 2. โซนเวลาด้านซ้าย */}
      <div className="w-20 pt-1 text-right border-r border-gray-200 dark:border-white/10 pr-6">
        {/* สีเวลาหลัก */}
        <span className="block font-bold text-lg text-gray-800 dark:text-neutral-100">{start.time}</span>
        {/* สี AM/PM */}
        <span className="block text-[12px] text-gray-500 dark:text-stone-500 uppercase">{start.suffix}</span>
        <span className="block text-[10px] text-gray-400 dark:text-stone-500 uppercase my-0.5">to</span>
        
        <span className="block font-bold text-lg text-gray-800 dark:text-neutral-100">{end.time}</span>
        <span className="block text-[12px] text-gray-500 dark:text-stone-500 uppercase">{end.suffix}</span>
      </div>

      {/* 🌟 3. โซนรายละเอียดด้านขวา */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          {/* Badge ชื่อห้อง: ใช้สีม่วงอ่อน (light-card) คล้ายๆ ในรูป */}
          <span className="px-3 py-1 rounded-full bg-light-purple text-dark-purple dark:bg-purple-500/20 dark:text-purple-300 text-[10px] font-bold uppercase tracking-widest">
            {event?.room?.name}
          </span>

          <Button 
            onClick={handleDelete}
            className="p-1.5 text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-hover hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* ชื่อ Title การจอง */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-1">{event.title}</h3>
        
        {/* วันที่การจอง */}
        <p className="text-sm text-gray-500 dark:text-stone-400">{formattedDate}</p>
        
        {/* แถบด้านล่าง: Status และ Duration */}
        <div className="mt-4 flex xs:flex-row flex-col xs:items-center xs:gap-4 gap-1 text-xs">
          
          <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
            <span className={`w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 shadow-[0_0_8px_rgba(147,51,234,0.4)] dark:shadow-[0_0_8px_rgba(192,132,252,0.6)]`}></span> 
            <span className="capitalize">{event.status}</span>
          </span>
          
          <span className="text-gray-500 dark:text-stone-500 flex items-center gap-1 xs:border-l xs:pl-4 border-gray-200 dark:border-white/10">
            <span className="material-symbols-outlined text-sm">schedule</span> {event.duration}
          </span>

          <span className="text-gray-500 dark:text-stone-500 flex items-center gap-1.5 xs:border-l xs:pl-4 border-gray-200 dark:border-white/10">
            <Key className="w-3.5 h-3.5 opacity-70" />
            <span>
              Passcode: <span className="font-mono text-gray-800 dark:text-stone-200 font-bold ml-0.5 tracking-wider">{event.passcode}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function CardEventsSkeleton() {
  return (
    <div className="flex gap-6 p-4 md:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar animate-pulse">
      
      {/* 🌟 โซนเวลาด้านซ้าย (Skeleton) */}
      <div className="w-20 pt-1 flex flex-col items-end border-r border-gray-200 dark:border-white/10 pr-6 gap-1">
        <div className="h-6 w-12 bg-gray-200 dark:bg-white/10 rounded"></div>
        <div className="h-3 w-6 bg-gray-200 dark:bg-white/10 rounded mb-1"></div>
        <div className="h-2 w-4 bg-gray-200 dark:bg-white/5 rounded my-0.5"></div>
        <div className="h-6 w-12 bg-gray-200 dark:bg-white/10 rounded mt-1"></div>
        <div className="h-3 w-6 bg-gray-200 dark:bg-white/10 rounded"></div>
      </div>

      {/* 🌟 โซนรายละเอียดด้านขวา (Skeleton) */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          {/* Badge Skeleton */}
          <div className="h-5 w-16 bg-gray-200 dark:bg-white/10 rounded-full"></div>
          {/* Button Skeleton */}
          <div className="h-7 w-7 bg-gray-200 dark:bg-white/10 rounded"></div>
        </div>
        
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-white/10 rounded mb-2"></div>
        
        {/* Date Skeleton */}
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded"></div>
        
        {/* แถบด้านล่าง (Status และ Duration) Skeleton */}
        <div className="mt-5 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/10"></div> 
            <div className="h-3 w-12 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
          
          <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-white/10 pl-4">
            <div className="h-4 w-4 bg-gray-200 dark:bg-white/10 rounded-full"></div>
            <div className="h-3 w-10 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
      
    </div>
  )
}