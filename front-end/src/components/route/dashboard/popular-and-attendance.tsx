import { DashboardAnalyticsResponse } from "@/utils/interface/response";
import AttendanceHealth from "./attendance-health"
import PopularRanking from "./popular-ranking"
import { endOfMonth, format, startOfMonth } from "date-fns";
import { bookingService } from "@/service/booking.service";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function PopularAndAttendance() {
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalyticsResponse | undefined>(undefined)

  const fetchAnalytics = async () => {
    const now = new Date()
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    try {
      const response = await bookingService.fetchAnalyticBooking(start, end)
      setDashboardAnalytics(response)
    } catch (error: any) {
      if (error.response?.status === 400) {
        Swal.fire({
          title: 'Error',
          text: "Send wrong date or missing date",
          icon: 'warning',
          confirmButtonColor: '#b495ff', 
        })
        return;
      }

      Swal.fire({
        title: 'Connection Error',
        text: 'An error occurred while fetching data. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b495ff',
      });
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 3A. Popular Rankings */}
      <PopularRanking popularRooms={dashboardAnalytics?.popularRooms} />
      {/* 3B. Attendance Health (สไตล์ในรูป The Velvet) */}
      <AttendanceHealth attendanceHealth={dashboardAnalytics?.attendanceHealth} />
    </div>
  )
}