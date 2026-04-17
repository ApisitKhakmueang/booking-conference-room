'use client'

import { useState } from 'react';
import { Search, MoreVertical, ArrowLeft, ArrowRight } from 'lucide-react';
import { User } from '@/utils/interface/response';
import Pagination from './pagination';

// ข้อมูลจำลอง 10 คน
const initialUsers: User[] = [
  { id: "1", fullName: "Julian Thorne", role: "Lead Curator", email: "j.thorne@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=1" },
  { id: "2", fullName: "Elena Vance", role: "Guest Relations", email: "vance.elena@velvetconcierge.com", status: "inactive", avatarUrl: "https://i.pravatar.cc/150?u=2" },
  { id: "3", fullName: "Marcus Sterling", role: "Security Director", email: "sterling.m@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=3" },
  { id: "4", fullName: "Aria Blake", role: "Experience Designer", email: "a.blake@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=4" },
  { id: "5", fullName: "Noah Russell", role: "Event Manager", email: "n.russell@velvetconcierge.com", status: "inactive", avatarUrl: "https://i.pravatar.cc/150?u=5" },
  { id: "6", fullName: "Sophia Bennett", role: "Client Advisor", email: "s.bennett@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=6" },
  { id: "7", fullName: "Liam Hayes", role: "Tech Support", email: "l.hayes@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=7" },
  { id: "8", fullName: "Olivia Carter", role: "Marketing Lead", email: "o.carter@velvetconcierge.com", status: "inactive", avatarUrl: "https://i.pravatar.cc/150?u=8" },
  { id: "9", fullName: "Ethan Cole", role: "Finance Director", email: "e.cole@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=9" },
  { id: "10", fullName: "Mia Foster", role: "HR Specialist", email: "m.foster@velvetconcierge.com", status: "active", avatarUrl: "https://i.pravatar.cc/150?u=10" },
];

export default function UserTable() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  
  // 🌟 Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🌟 คำนวณหา Index ของข้อมูลที่จะแสดงในหน้านั้นๆ
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // ฟังก์ชันสลับสถานะ
  const toggleStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
        : u
    ));
  };

  return (
    <div className="w-full mt-6 space-y-6 text-white font-sans">
      
      {/* Top Bar: Search & Invite Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="w-full bg-[#18181b] text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#9b7aee] border border-white/5 transition-all shadow-sm" 
          />
        </div>
        <button className="w-full sm:w-auto bg-[#9b7aee] hover:bg-[#8a68df] text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md">
          + Invite Member
        </button>
      </div>

      {/* Table Area */}
      <div className="w-full">
        
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-6">
          <div className="col-span-5 md:col-span-4">MEMBER NAME</div>
          <div className="col-span-4 md:col-span-5">IDENTITY</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        {/* Rows - ลูปจาก currentUsers (ข้อมูลเฉพาะหน้าปัจจุบัน) แทน users ทั้งหมด */}
        <div>
          {currentUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 sm:px-6 sm:py-5 bg-[#1c1c1e] hover:bg-[#232326] rounded-2xl transition-colors border border-white/5 shadow-sm mb-3">
              
              {/* Member Col */}
              <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                <div className="relative">
                  <img src={user.avatarUrl || "https://via.placeholder.com/150"} alt={user.fullName} className="w-10 h-10 rounded-full object-cover bg-gray-800" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#1c1c1e] rounded-full ${user.status === 'active' ? 'bg-[#9b7aee]' : 'bg-gray-500'}`}></div>
                </div>
                <div>
                  <div className="font-bold text-[15px] text-gray-100">{user.fullName}</div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {user.role || 'MEMBER'}
                  </div>
                </div>
              </div>

              {/* Identity Col */}
              <div className="col-span-4 md:col-span-5 text-sm font-medium text-gray-400 truncate">
                {user.email}
              </div>

              {/* Status Col (Toggle) */}
              <div className="col-span-2 flex items-center gap-3">
                <button 
                  onClick={() => toggleStatus(user.id)} 
                  className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${user.status === 'active' ? 'bg-[#9b7aee]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${user.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Action Col */}
              <div className="col-span-1 flex justify-end">
                <button className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* 🌟 Table Footer (Pagination UI) */}
        <Pagination users={users} currentPage={currentPage} setCurrentPage={setCurrentPage} />

      </div>
    </div>
  );
}