'use client'

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileHeader from './profile-header';
import SummaryCard from './summary-card';
import HistoryTableContainer from './history-table-container';
import { useUserOverview } from '@/hooks/data/useUserOverview';

export default function UserHistory({ userID }: { userID: string }) {
  const router = useRouter();
  const { overviewData, isLoadingOverview } = useUserOverview(userID)
  const user = overviewData?.user
  const statistics = overviewData?.statistics

  return (
    <div className="w-full max-w-6xl mx-auto mt-5 space-y-4 pb-5">
      
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
      <HistoryTableContainer userID={userID} />
    </div>
  )
}