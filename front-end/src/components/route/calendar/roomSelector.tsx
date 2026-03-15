import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// Mock Data สำหรับห้อง
// const rooms = [
//   { id: "all", name: "All Rooms" },
//   { id: "1", name: "Meeting Room A" },
//   { id: "2", name: "Conference Hall B" },
//   { id: "3", name: "Training Room C" },
// ];

export interface ArrangeRoom {
  id: string
  name: string
  roomNumber: number
}

export default function RoomSelector({ selectedRoom, setSelectedRoom, rooms }: { 
  selectedRoom: ArrangeRoom | undefined, 
  setSelectedRoom: (room:ArrangeRoom) => void
  rooms: ArrangeRoom[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((room: typeof rooms[0]) => {
    setSelectedRoom(room);
    setIsOpen(false);
    // ตรงนี้ใส่ Logic การเปลี่ยนห้อง หรือ fetch ข้อมูลใหม่
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ปุ่ม Trigger: ใช้ Class เดียวกับปุ่ม Prev/Next ของคุณเป๊ะๆ 
         เพิ่ม flex, items-center, justify-between เพื่อจัด icon
      */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-2 min-w-35
          px-3 py-1 text-sm rounded cursor-pointer transition-colors
          border border-white dark:border-hover 
          hover:bg-light-card hover:text-white
          dark:hover:bg-hover
          ${isOpen ? 'bg-light-card text-white dark:bg-hover' : ''}
        `}
      >
        <span className="truncate">{selectedRoom?.name}</span>
        
        {/* Icon ลูกศร (Arrow Down) */}
        {
          isOpen ? <ChevronUp /> : <ChevronDown />
        }
        {/* <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg> */}
      </button>

      {/* ตัวรายการ Dropdown (Menu List)
         ใช้สีจาก Variable ที่คุณให้มา
      */}
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-md shadow-lg border overflow-hidden
          bg-white border-light-google/30
          dark:bg-card dark:border-hover
        ">
          <ul className="max-h-60 overflow-auto py-1 no-scrollbar">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => handleSelect(room)}
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors
                    
                    /* Hover Effect: ใช้สีเดียวกับ Hover ของปุ่มหลัก */
                    hover:bg-light-card hover:text-white
                    dark:hover:bg-hover dark:text-gray-200
                    
                    /* Active State (ห้องที่เลือกอยู่) */
                    ${selectedRoom?.id === room.id 
                      ? 'bg-light-sidebar text-light-main dark:bg-sidebar dark:text-white font-medium' 
                      : 'text-light-secondary dark:text-gray-400'}
                  `}
                >
                  {room.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}