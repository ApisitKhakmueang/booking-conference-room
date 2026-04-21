import { useEffect, useState } from "react";
import HistoryHeader from "./history-header";
import HistoryPagination from "./history-pagination";
import HistoryCard, { HistoryCardSkeleton } from "./history-card";
import MonthYearPicker from "@/components/utils/month-year-picker";
import StatusPicker from "./status-picker";
import { usePaginatedUserBookings } from "@/hooks/data/usePaginatedUserBookings";

export default function HistoryTableContainer({ userID }: { userID: string }) {
  const [currentStatus, setCurrentStatus] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // บวก 1 เพราะ Date ของ JS เดือนเริ่มที่ 0

  // 🌟 รีเซ็ตหน้ากลับเป็นหน้า 1 เสมอเวลาเปลี่ยนตัวกรอง
  useEffect(() => {
    setCurrentPage(1);
  }, [currentStatus, currentDate]);

  const { bookingsData, isLoadingBookings } = usePaginatedUserBookings(userID, currentPage, itemsPerPage, currentStatus, year, month);

  // 🌟 ดึงข้อมูลออกจาก SWR
  const currentBookings = bookingsData?.data || [];
  const totalItems = bookingsData?.meta.totalItems || 0;
  const totalPages = bookingsData?.meta.totalPages || 1;
  const indexOfFirstItem = bookingsData?.meta.indexOfFirstItem || 0;
  const indexOfLastItem = bookingsData?.meta.indexOfLastItem || 0;

  return (
    <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar rounded-3xl md:p-5 p-4 shadow-xl dark:shadow-none">
      
      {/* Table Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2">
        <h2 className="text-lg font-bold text-light-main dark:text-main">Booking History</h2>
        <div className="flex flex-col items-start xs:flex-row md:items-center gap-3 w-full sm:w-auto">
          <MonthYearPicker currentDate={currentDate} setCurrentDate={setCurrentDate} />
          <StatusPicker currentStatus={currentStatus} setCurrentStatus={setCurrentStatus} />
        </div>
      </div>

      {/* Header (Desktop) */}
      <HistoryHeader />

      {/* Rows */}
      <div className="flex flex-col flex-1 relative gap-2 mt-3">
        {isLoadingBookings ? (
          <HistoryCardSkeleton /> // 🌟 กำลังโหลด: แสดง Skeleton 4 แถว
        ) : currentBookings.length > 0 ? (
          currentBookings.map((booking) => (
            <HistoryCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="text-center py-10 text-light-secondary dark:text-secondary text-sm font-medium">No bookings found for this period.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <HistoryPagination 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          totalPages={totalPages}
          totalItems={totalItems}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
        />
      )}

    </div>
  )
}