'use client'

import { useState } from 'react';
import { Search } from 'lucide-react';
import { User } from '@/utils/interface/response';
import Pagination from './pagination';
import Header from './header';
import { Input } from '@/components/ui/input';
import UserCard from './user-card';

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
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
        : u
    ));
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
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-sidebar border border-gray-200 dark:border-white/10 text-light-main dark:text-main transition-all shadow-sm" 
          />
        </div>
        {/* <button className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-lg bg-dark-purple hover:bg-light-hover/90 dark:bg-dark-purple/90 dark:hover:bg-dark-purple text-white shadow-md transition-all">
          + Invite Member
        </button> */}
      </div>

      {/* Table Area - Theme แบบเดียวกับ RoomList */}
      <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar rounded-3xl md:p-5 p-4 shadow-xl dark:shadow-none">
        
        {/* Header */}
        <Header />

        {/* List Content */}
        <div className="flex flex-col gap-3 mb-6">
          {currentUsers.length > 0 ? (
            <UserCard currentUsers={currentUsers} toggleStatus={toggleStatus} />
          ) : (
            <div className="text-center py-10 text-light-secondary dark:text-secondary text-sm font-medium">No users available.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination users={users} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

      </div>
    </div>
  );
}