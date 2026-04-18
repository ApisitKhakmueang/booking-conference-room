import { useState } from "react";
import HistoryHeader from "./history-header";
import HistoryPagination from "./history-pagination";
import { BookingHistoryItem } from "@/utils/interface/response";
import HistoryCard from "./history-card";
import MonthYearPicker from "@/components/utils/month-year-picker";
import StatusPicker from "./status-picker";

interface HistoryTableContainer {
  booking: BookingHistoryItem[]
}

const ITEMS_PER_PAGE = 4

export default function HistoryTableContainer({ booking }: HistoryTableContainer) {
  const [currentStatus, setCurrentStatus] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = booking.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentBookings = booking.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="flex flex-col">
        {currentBookings.length > 0 ? (
          currentBookings.map((booking) => (
            <HistoryCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="text-center py-10 text-light-secondary dark:text-secondary text-sm font-medium">No bookings found.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <HistoryPagination booking={booking} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}

    </div>
  )
}