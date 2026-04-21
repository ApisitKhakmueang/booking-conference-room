'use client'

import { useState } from 'react';
import { Search } from 'lucide-react';
import { UserResponse } from '@/utils/interface/response';
import UserPagination from './user-pagination';
import Header from './header';
import { Input } from '@/components/ui/input';
import UserCard from './user-card';
import Swal from 'sweetalert2';
import { usePaginatedUsers } from '@/hooks/data/usePaginatedUsers';
import { adminService } from '@/service/booking.service';

export default function UserTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  const [updatingID, setUpdatingID] = useState<string | null>(null);

  // 🌟 เรียกใช้ Hook แค่บรรทัดเดียว!
  const { usersData, reloadUsers } = usePaginatedUsers(currentPage, itemsPerPage, searchTerm);

  // ดึงข้อมูลออกมาก่อนใช้
  const currentUsers = usersData?.data || [];
  const totalPages = usersData?.meta.totalPages || 1;
  const totalUsers = usersData?.meta.totalItems || 0;
  const indexOfFirstItem = usersData?.meta.indexOfFirstItem || 0;
  const indexOfLastItem = usersData?.meta.indexOfLastItem || 0;

  const toggleStatus = async (id: string, currentStatus: string) => {
    // 🌟 2. ถ้ามี ID นี้กำลังอัปเดตอยู่ ให้ Return ทิ้งเลย (ป้องกันคนกดรัวตอนยังไม่เสร็จ)
    if (updatingID === id) return;

    setUpdatingID(id); // ล็อคว่า ID นี้กำลังทำรายการนะ

    const updateStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const updatedUsers = currentUsers.map(u => 
      u.id === id ? { ...u, status: updateStatus } : u
    );
    
    reloadUsers({ ...usersData!, data: updatedUsers }, false);

    try {
      console.log("update status: ", updateStatus)
      await adminService.updateUserStatus(id, updateStatus); 
      
      setUpdatingID(null); 
      reloadUsers(); 
      // 🌟 3. ปลดล็อคเมื่อเสร็จสิ้น
    } catch (error) {
      setUpdatingID(null); // ปลดล็อคแม้ว่าจะพัง
      reloadUsers();
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  return (
    <div className="w-full max-w-6xl mt-6 space-y-6 pb-6">
      
      {/* Top Bar: Search & Invite Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-secondary dark:text-secondary" />
          <Input 
            type="text" 
            placeholder="Search members..." 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-sidebar border border-gray-200 dark:border-white/10 text-light-main dark:text-main transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Table Area - Theme แบบเดียวกับ RoomList */}
      <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar rounded-3xl md:p-5 p-4 shadow-xl dark:shadow-none">
        
        {/* Header */}
        <Header />

        {/* List Content */}
        <div className="flex flex-col gap-3 mb-6">
          {currentUsers.length > 0 ? (
            <UserCard 
              currentUsers={currentUsers} 
              toggleStatus={toggleStatus} 
              updatingID={updatingID} // 🌟 4. ส่ง updatingID ลงไปให้ตัวลูก
            />
          ) : (
            <div className="text-center py-10 text-light-secondary dark:text-secondary text-sm font-medium">No users available.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <UserPagination 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalUsers={totalUsers}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
          />
        )}

      </div>
    </div>
  );
}