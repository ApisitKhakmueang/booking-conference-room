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
    // 🌟 พื้นหลังการ์ด: ขาว (Light) / เทาเข้ม (Dark)
    <div className="flex-3 bg-light-main-background dark:bg-card border border-gray-200 dark:border-white/5 rounded-2xl p-8 shadow-lg flex flex-col justify-between transition-colors">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        {/* 🌟 หัวข้อ: สีเทากลาง (Light) / สีเทาอ่อน (Dark) */}
        <h3 className="text-sm font-bold text-light-muted dark:text-gray-400 uppercase tracking-widest">Attendance Health</h3>
        
        {/* 🌟 Legend (คำอธิบายสี) */}
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-light-secondary dark:text-gray-500">
          {/* 🌟 ใช้สี Status จาก Theme: bg-success, bg-danger, bg-warning */}
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger"></span> Cancelled</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning"></span> No Show</span>
        </div>
      </div>

      {/* 🌟 เรียกใช้ Component ลูก */}
      <AttendanceStatusCard attendanceHealth={attendanceHealth} percentageData={percentageData} />

      {/* Stacked Bar Area */}
      <div>
        {/* 🌟 พื้นหลังหลอดกราฟ: เทาอ่อน (Light) / ขาวโปร่ง (Dark) */}
        <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-gray-100 dark:bg-white/5">
          {/* 🌟 สีหลอดกราฟดึงจาก Theme */}
          <div className="bg-success transition-all duration-1000" style={{ width: `${completedPct}%` }}></div>
          <div className="bg-danger transition-all duration-1000" style={{ width: `${cancelledPct}%` }}></div>
          <div className="bg-warning transition-all duration-1000" style={{ width: `${noShowPct}%` }}></div>
        </div>
        
        {/* 🌟 ข้อความด้านล่าง: สีเทาเข้ม (Light) / สีเทาอ่อน (Dark) */}
        <div className="flex justify-between text-[10px] font-bold text-light-secondary dark:text-gray-500 uppercase tracking-wider">
          <span>{attendanceHealth?.completionRate || 0}% Completion Rate</span>
          <span>Weekly Target: 95%</span>
        </div>
      </div>

    </div>
  );
}