import { DashboardAnalyticsResponse } from "@/utils/interface/response";
import AttendanceHealth from "./attendance-health"
import PopularRanking from "./popular-ranking"

export const mockDashboardAnalytics: DashboardAnalyticsResponse = {
  attendanceHealth: {
    completed: 124,
    cancelled: 12,
    noShow: 4,
    completionRate: 88,
  },
  popularRooms: [
    { id: 1, roomNumber: '01', name: "Room 1 (The Observatory)", percentage: 94 },
    { id: 5, roomNumber: '05', name: "Room 5 (Zen Den)", percentage: 82 },
    { id: 2, roomNumber: '02', name: "Studio 2", percentage: 67 },
  ],
};

export default function PopularAndAttendance() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 3A. Popular Rankings */}
      <PopularRanking popularRooms={mockDashboardAnalytics.popularRooms} />
      {/* 3B. Attendance Health (สไตล์ในรูป The Velvet) */}
      <AttendanceHealth attendanceHealth={mockDashboardAnalytics.attendanceHealth} />
    </div>
  )
}