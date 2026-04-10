import { AttendanceHealthResponse } from '@/utils/interface/response';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface PercentageData {
  completed: number;
  cancelled: number;
  noShow: number;
};

export default function AttendanceStatusCard({ attendanceHealth, percentageData }: { attendanceHealth?: AttendanceHealthResponse, percentageData: PercentageData }) {
  const isLoading = attendanceHealth === undefined || percentageData === undefined;

  return (
    <div className="grid grid-cols-3 gap-4 md:mb-8 mb-5">
      {/* Completed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {/* 🌟 ใช้สี text-success จาก Theme */}
          <CheckCircle2 className="xs:flex hidden w-4 h-4 text-success" />
          <span className="text-[10px] font-bold text-success uppercase tracking-widest">Completed</span>
        </div>
        {/* ⏳ Skeleton: สีเทา (Light) / ขาวโปร่ง (Dark) */}
        {isLoading ? (
          <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
        ) : (
          <p className="md:text-4xl text-2xl font-extrabold text-success drop-shadow-sm">
            {percentageData.completed > 0 ? `${percentageData.completed.toFixed(1)}%` : `${attendanceHealth?.completed || 0}`}
          </p>
        )}
      </div>

      {/* Cancelled */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {/* 🌟 ใช้สี text-danger จาก Theme */}
          <XCircle className="xs:flex hidden w-4 h-4 text-danger" />
          <span className="text-[10px] font-bold text-danger uppercase tracking-widest">Cancelled</span>
        </div>
        {isLoading ? (
          <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
        ) : (
          <p className="md:text-4xl text-2xl font-extrabold text-danger drop-shadow-sm">
            {percentageData.cancelled > 0 ? `${percentageData.cancelled.toFixed(1)}%` : `${attendanceHealth?.cancelled || 0}`}
          </p>
        )}
      </div>

      {/* No Show */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {/* 🌟 ใช้สี text-warning จาก Theme */}
          <AlertCircle className="xs:flex hidden w-4 h-4 text-warning" />
          <span className="text-[10px] font-bold text-warning uppercase tracking-widest">No Show</span>
        </div>
        {isLoading ? (
          <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
        ) : (
          <p className="md:text-4xl text-2xl font-extrabold text-warning drop-shadow-sm">
            {percentageData.noShow > 0 ? `${percentageData.noShow.toFixed(1)}%` : `${attendanceHealth?.noShow || 0}`}
          </p>
        )}
      </div>
    </div>
  );
}