'use client'

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileHeader from './profile-header';
import SummaryCard from './summary-card';
import HistoryTableContainer from './history-table-container';

// --- 1. Mock JSON Data ---
const mockApiResponse = {
  user: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    fullName: "Apisit Khakmueang",
    email: "guy.apisit2546@gmail.com",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    role: "user",
    status: "active"
  },
  statistics: {
    upcoming: 15, 
    completed: 35,
    cancelled: 7,
    noShow: 3
  },
  bookingHistory: [
    {
      id: "987fcdeb-51a2-43d7-9012-34567890abcd",
      title: "Project Sync",
      startTime: "2026-04-17T10:00:00Z",
      endTime: "2026-04-17T12:00:00Z",
      status: "confirm", 
      checkedInAt: null,
      Room: { id: "room-uuid-1", name: "Suite 01", roomNumber: 1, location: "Building A", capacity: 10, status: "available" }
    },
    {
      id: "567fcdeb-51a2-43d7-9012-34567890efgh",
      title: "Client Meeting",
      startTime: "2026-04-15T09:00:00Z",
      endTime: "2026-04-15T10:30:00Z", // ลองเทสเวลาที่มีเศษนาที
      status: "complete",
      checkedInAt: "2026-04-15T08:55:00Z",
      Room: { id: "room-uuid-2", name: "East Wing", roomNumber: 2, location: "Building B", capacity: 10, status: "available" }
    },
    {
      id: "111fcdeb-51a2-43d7-9012-345678901111",
      title: "Team Standup",
      startTime: "2026-04-14T09:00:00Z",
      endTime: "2026-04-14T10:00:00Z",
      status: "no_show",
      checkedInAt: null,
      Room: { id: "room-uuid-1", name: "Suite 01", roomNumber: 1, location: "Building A", capacity: 10, status: "available" }
    },
    {
      id: "222fcdeb-51a2-43d7-9012-345678902222",
      title: "Design Review",
      startTime: "2026-04-10T14:00:00Z",
      endTime: "2026-04-10T16:00:00Z",
      status: "cancelled",
      checkedInAt: null,
      Room: { id: "room-uuid-3", name: "Boardroom", roomNumber: 3, location: "Building C", capacity: 10, status: "available" }
    },
    {
      id: "333fcdeb-51a2-43d7-9012-345678903333",
      title: "Interview",
      startTime: "2026-04-05T10:00:00Z",
      endTime: "2026-04-05T11:00:00Z",
      status: "complete",
      checkedInAt: "2026-04-05T09:50:00Z",
      Room: { id: "room-uuid-2", name: "East Wing", roomNumber: 2, location: "Building B", capacity: 10, status: "available" }
    }
  ]
};

// --- 3. Main Component ---

export default function UserHistory({ userId }: { userId: string }) {
  const router = useRouter();

  // ดึงข้อมูลมาจาก mockApiResponse
  const { user, statistics, bookingHistory } = mockApiResponse;

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 space-y-4 pb-5">
      
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-light-secondary dark:text-secondary hover:text-dark-purple dark:hover:text-white transition-colors w-fit cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Summary Cards */}
      <SummaryCard statistics={statistics} />

      {/* History Table Container */}
      <HistoryTableContainer booking={bookingHistory} />
    </div>
  )
}