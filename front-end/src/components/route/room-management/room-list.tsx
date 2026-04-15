import { useState } from "react";
import RoomCard from "./room-card";
import Swal from "sweetalert2";
import { RoomListProps } from "@/utils/interface/interface";
import Pagination from "./pagination";

const ITEMS_PER_PAGE = 4;

export default function RoomList({ rooms, setRooms }: RoomListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalRooms = rooms.length;
  const totalPages = Math.ceil(totalRooms / ITEMS_PER_PAGE);
  
  // 🌟 คำนวณรายการห้องที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRooms = rooms.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteRoom = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this room?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6B6B', // 🌟 สี Danger จาก Theme
      cancelButtonColor: '#8370ff',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setRooms(prev => {
            const newRooms = prev.filter(room => room.id !== id);
            
            // ตรวจสอบว่าถ้าลบแล้วหน้าปัจจุบันว่างเปล่า ให้ถอยกลับไปหน้าก่อนหน้า
            const newTotalPages = Math.ceil(newRooms.length / ITEMS_PER_PAGE);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
            return newRooms;
        });
        Swal.fire({ title: 'Deleted!', text: 'Room has been deleted.', icon: 'success', timer: 1500, showConfirmButton: false });
        // TODO: ยิง API เพื่อลบห้องใน Database จริงที่นี่
      }
    });
  };

  return (
    <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar rounded-3xl md:p-5 p-4 shadow-xl dark:shadow-none">
      {/* Table Headers */}
      <div className="hidden md:flex items-center px-5 mb-4 text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold">
        <div className="w-1/3">Resource Name</div>
        <div className="w-1/4">Capacity</div>
        <div className="w-1/4">Status</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* List Content */}
      <div className="flex flex-col gap-3 mb-6">
        {currentRooms.length > 0 ? (
          currentRooms.map((room) => (
            <RoomCard key={room.id} room={room} onDelete={handleDeleteRoom} />
          ))
        ) : (
          <div className="text-center py-10 text-light-secondary dark:text-secondary text-sm">No rooms available.</div>
        )}
      </div>

      {/* 🌟 4. Pagination Controls */}
      {totalPages > 1 && (
        <Pagination rooms={rooms} currentRooms={currentRooms} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </div>
  )
}