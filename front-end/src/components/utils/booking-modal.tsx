import { BookingModalProps } from "@/utils/interface/interface";
import { useMemo } from "react";
import FormModal from "./form-modal";
import { useRoomData } from "@/hooks/data/useRoomData";
// import { ChevronDown, ChevronUp } from "lucide-react";

export default function BookingModal({ isAddModalOpen, setIsAddModalOpen, typeOperate, currentDate, setCurrentDate, selectedEvent, onSuccess, preselectedRoomNumber }: BookingModalProps) {
  const { room: rawRoom, isLoading, isError } = useRoomData();
  
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

  return (
    <>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
          
          {/* 1. Backdrop (พื้นหลังเบลอและมืดลง) */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddModalOpen(false)} // กดพื้นที่ว่างเพื่อปิด
          ></div>

          {/* 2. Modal Box (กล่องตรงกลาง) */}
          <FormModal 
            setIsAddModalOpen={setIsAddModalOpen} 
            typeOperate={typeOperate} 
            rooms={rooms} 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedEvent={selectedEvent} 
            onSuccess={onSuccess} // 🌟 ส่งต่อลงไปอีกทอด
            preselectedRoomNumber={preselectedRoomNumber}
          />
        </div>
      )}
    </>
  )
}