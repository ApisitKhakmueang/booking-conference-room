'use client';

import UpNextCard from './up-next-card';
import QuickBookCard from './quick-book-card';
import OverviewCurrentlyActive from './overview-currently-active';
import PopularAndAttendance from './popular-and-attendance';
import { useState } from 'react';
import BookingModal from '@/components/utils/booking-modal';
import { BookingEvent } from '@/utils/interface/interface';

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [typeOperate, setTypeOperate] = useState<'add' | 'update'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | undefined>(undefined);
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleAddClick = () => {
    setTypeOperate('add');
    setSelectedEvent(undefined); 
    setIsAddModalOpen(true);
  };
  const handleEditClick = (event: BookingEvent) => {
    console.log("event: ", event)
    setTypeOperate('update');
    setSelectedEvent(event); 
    setIsAddModalOpen(true);
  };

  const modalProps = { isAddModalOpen, setIsAddModalOpen, typeOperate, currentDate, setCurrentDate, selectedEvent }

  return (
    <div className="flex flex-col gap-6 w-full text-sm pb-6">
      {/* 🌟 ROW 1: Up Next & Quick Book */}
      <div className="flex flex-col lg:flex-row gap-6"> 
        {/* 1A. Up Next Card (กินพื้นที่ 2 ใน 3) */}
        <UpNextCard handleEditClick={handleEditClick} />

        {/* 1B. Quick Book Card (กินพื้นที่ 1 ใน 3) */}
        <QuickBookCard handleAddClick={handleAddClick} />
      </div>

      {/* 🌟 ROW 2: Overview & Currently Active */}
      <OverviewCurrentlyActive />

      {/* 🌟 ROW 3: Popular Rankings & Attendance Health */}
      <PopularAndAttendance />

      {isAddModalOpen && (
        <BookingModal {...modalProps} />
      )}
    </div>
  );
}