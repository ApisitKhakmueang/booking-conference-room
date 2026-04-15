"use client";
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import RoomCard from './room-card';
import { RoomResp } from '@/utils/interface/response';
import { Button } from '@/components/ui/button';
import StatusSection from './status-section';
import RoomList from './room-list';

// Mock Data
const INITIAL_ROOMS: RoomResp[] = [
  { id: '1', name: 'Suite 01', roomNumber: 1, location: 'Primary Wing', capacity: 8, isActive: 'active' },
  { id: '2', name: 'Suite 02', roomNumber: 2, location: 'Creative Hub', capacity: 12, isActive: 'maintenance' },
  { id: '3', name: 'Suite 03', roomNumber: 3, location: 'Library Hall', capacity: 4, isActive: 'active' },
  { id: '4', name: 'Suite 04', roomNumber: 4, location: 'East Wing', capacity: 10, isActive: 'active' },
  { id: '5', name: 'Suite 05', roomNumber: 5, location: 'West Wing', capacity: 6, isActive: 'active' },
  { id: '6', name: 'Suite 06', roomNumber: 6, location: 'North Wing', capacity: 20, isActive: 'maintenance' },
];

const ITEMS_PER_PAGE = 4;

export default function RoomManagement() {
  const [rooms, setRooms] = useState<RoomResp[]>(INITIAL_ROOMS);
  
  // 🌟 State สำหรับ Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // คำนวณสถิติแบบ Real-time
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(r => r.isActive === 'active').length;
  const maintenanceRooms = rooms.filter(r => r.isActive === 'maintenance').length;
  const activeRate = totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0;
  const maintenanceRate = totalRooms > 0 ? Math.round((maintenanceRooms / totalRooms) * 100) : 0;

  // 🌟 คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(totalRooms / ITEMS_PER_PAGE);

  // 🌟 คำนวณรายการห้องที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRooms = rooms.slice(indexOfFirstItem, indexOfLastItem);

  // ฟังก์ชันเปลี่ยนหน้า
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(page);

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
    <div className="w-full text-sm pb-3">
      
      {/* 1. Add Button */}
      <div className="flex md:flex-row flex-col justify-between md:items-center gap-2 mb-6">
        <p className="text-light-secondary dark:text-secondary text-lg leading-relaxed">Manage and configure your meeting spaces.</p>

        <div>
          <Button 
            className="flex items-center gap-2 bg-dark-purple hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md dark:shadow-none">
            <Plus className="w-4 h-4" /> Add New Room
          </Button>
        </div>
      </div>

      {/* 2. Stats Section */}
      <StatusSection rooms={rooms} />

      {/* 3. Room List Section */}
      <RoomList rooms={rooms} setRooms={setRooms} />
      
    </div>
  );
}