import { ModalProps } from "@/utils/interface/interface";
import { useRoomStore } from "@/stores/room.store";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";
import FormModal from "../utils/form-modal";
// import { ChevronDown, ChevronUp } from "lucide-react";

export default function Modal({ isAddModalOpen, setIsAddModalOpen, typeOperate, setCurrentDate, currentDate, selectedEvent, onSuccess }: ModalProps) {
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
          <FormModal 
            setIsAddModalOpen={setIsAddModalOpen} 
            typeOperate={typeOperate} 
            rooms={rooms} 
            setCurrentDate={setCurrentDate}
            currentDate={currentDate}
            selectedEvent={selectedEvent} 
            onSuccess={onSuccess} // 🌟 ส่งต่อลงไปอีกทอด
          />
        </div>
      )}
    </>
  )
}