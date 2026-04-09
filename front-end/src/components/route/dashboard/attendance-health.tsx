import { AttendanceHealthResponse } from '@/utils/interface/response';
import AttendanceStatusCard from './attendance-status-card';

export default function AttendanceHealth({ attendanceHealth }: { attendanceHealth?: AttendanceHealthResponse }) {
  
  // 🌟 คำนวณเปอร์เซ็นต์สำหรับกราฟ Stacked Bar (ถ้าข้อมูลมาครบ)
  const total = (attendanceHealth?.completed || 0) + (attendanceHealth?.cancelled || 0) + (attendanceHealth?.noShow || 0);
  const completedPct = total > 0 ? ((attendanceHealth?.completed || 0) / total) * 100 : 0;
  const cancelledPct = total > 0 ? ((attendanceHealth?.cancelled || 0) / total) * 100 : 0;
  const noShowPct = total > 0 ? ((attendanceHealth?.noShow || 0) / total) * 100 : 0;

  const percentageData = {
    completed: completedPct,
    cancelled: cancelledPct,
    noShow: noShowPct
  };

  return (
    <div className="flex-3 bg-card border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Attendance Health</h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400"></span> Cancelled</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400"></span> No Show</span>
        </div>
      </div>

      {/* 🌟 เรียกใช้ Component ลูกที่เพิ่งสร้าง แล้วโยนข้อมูลใส่เข้าไป */}
      <AttendanceStatusCard attendanceHealth={attendanceHealth} percentageData={percentageData} />

      {/* Stacked Bar Area */}
      <div>
        <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-white/5">
          {/* ใช้ Style แบบ Inline กำหนดความกว้าง (width) ให้เปลี่ยนตามข้อมูลจริง */}
          <div className="bg-emerald-600 dark:bg-emerald-400 transition-all duration-1000" style={{ width: `${completedPct}%` }}></div>
          <div className="bg-rose-600 dark:bg-rose-400 transition-all duration-1000" style={{ width: `${cancelledPct}%` }}></div>
          <div className="bg-orange-600 dark:bg-orange-400 transition-all duration-1000" style={{ width: `${noShowPct}%` }}></div>
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <span>{attendanceHealth?.completionRate || 0}% Completion Rate</span>
          <span>Weekly Target: 95%</span>
        </div>
      </div>

    </div>
  );
}