import { Button } from "@/components/ui/button";
import { bookingService } from "@/service/booking.service";
import { useAuthStore } from "@/stores/auth.store";
import { OccupyModalProps } from "@/utils/interface/interface";
import { MonitorX } from "lucide-react";
import Swal from "sweetalert2";

export default function OccupyModal({ setIsOccupyModalOpen, selectedBooking }: OccupyModalProps) {
  const user = useAuthStore((state) => state.user)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // สำคัญมาก! ป้องกันไม่ให้การคลิกทะลุไปเปิด Modal แก้ไข

    const bookingStartTime = new Date(selectedBooking.endTime); // เวลาที่เริ่มจอง
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
      cancelButtonColor: '#8B8FC7',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        const result = await bookingService.checkoutBooking(selectedBooking.id);
        
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
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete booking', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* พื้นหลังเบลอ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOccupyModalOpen(false)}
      ></div>
      
      {/* กล่องรายละเอียด */}
      <div className="relative bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 border dark:border-sidebar">
        <div className="bg-rose-500 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MonitorX size={20} />
            Room Occupied
          </h3>
          <button onClick={() => setIsOccupyModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full cursor-pointer transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-gray-700 dark:text-gray-200">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Meeting Title</p>
            <p className="font-semibold text-lg">{selectedBooking.title || "Untitled Meeting"}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Time</p>
              <p className="font-medium">
                {new Date(selectedBooking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">End Time</p>
              <p className="font-medium">
                {new Date(selectedBooking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
          
          {/* ถ้าใน BookingEventResponse ของคุณมีชื่อคนจอง ให้เอามาใส่ตรงนี้ได้เลยครับ */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Booked by</p>
            <p className="font-medium">{selectedBooking.User?.fullName}</p>
          </div> 
          
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-sidebar/50 border-t dark:border-sidebar flex justify-end">
          <Button 
            onClick={() => setIsOccupyModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 dark:text-gray-300 dark:bg-transparent dark:border-sidebar dark:hover:bg-white/5 rounded-lg transition-colors shadow-sm"
          >
            Close
          </Button>

          {/* 🌟 ปุ่ม End สีแดงเด่นชัด */}
          {user?.id === selectedBooking.User?.id && (
            <Button 
              onClick={(e) => {
                // ใส่ฟังก์ชัน End Booking ตรงนี้
                setIsOccupyModalOpen(false);
                handleDelete(e)
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-md transition-all ml-2"
            >
              End This Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}