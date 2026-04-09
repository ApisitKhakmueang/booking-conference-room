import { DashboardAnalyticsResponse } from "@/utils/interface/response";
import AttendanceHealth from "./attendance-health"
import PopularRanking from "./popular-ranking"
import { endOfMonth, format, startOfMonth } from "date-fns";
import { bookingService } from "@/service/booking.service";
import { useEffect, useState } from "react";

export default function PopularAndAttendance() {
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalyticsResponse | undefined>(undefined)

  const fetchAnalytics = async () => {
    const now = new Date()
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    try {
      const response = await bookingService.fetchAnalyticBooking(start, end)
      setDashboardAnalytics(response)
    } catch (error) {
      console.log('error: ', error)
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