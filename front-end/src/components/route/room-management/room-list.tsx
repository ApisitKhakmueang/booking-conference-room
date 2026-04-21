import { useState } from "react";
import RoomCard, { RoomCardSkeleton } from "./room-card";
import Swal from "sweetalert2";
import { RoomListProps } from "@/utils/interface/interface";
import RoomPagination from "./room-pagination";

const ITEMS_PER_PAGE = 4;

export default function RoomList({ rooms, handleEditClick, reloadRoom, isLoading }: RoomListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalRooms = rooms.length;
  const totalPages = Math.ceil(totalRooms / ITEMS_PER_PAGE);
  
  // 🌟 คำนวณรายการห้องที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRooms = rooms.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar rounded-3xl md:p-5 p-4 shadow-xl dark:shadow-none">
      {/* Table Headers */}
      <div className="hidden md:flex items-center px-5 mb-4 text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold">
        <div className="w-1/3">Room Name</div>
        <div className="w-1/4">Capacity</div>
        <div className="w-1/4">Status</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* List Content */}
      <div className="flex flex-col gap-3 mb-6">
        {isLoading ? (
          <RoomCardSkeleton />
        ) : currentRooms.length > 0 ? (
          currentRooms.map((room) => (
            <div key={room.id} onClick={() => handleEditClick(room)}>
              <RoomCard room={room} onDelete={reloadRoom} />
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-light-secondary dark:text-secondary text-sm">No rooms available.</div>
        )}
      </div>

      {/* 🌟 4. Pagination Controls */}
      {totalPages > 1 && (
        <RoomPagination rooms={rooms} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </div>
  )
}