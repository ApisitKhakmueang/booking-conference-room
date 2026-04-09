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
    <div className="grid grid-cols-3 gap-4 mb-8">
      {/* Completed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Completed</span>
        </div>
        {/* ⏳ เช็ค Loading */}
        {isLoading ? (
          <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
        ) : (
          <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {percentageData.completed > 0 ? `${percentageData.completed.toFixed(1)}%` : `${attendanceHealth?.completed || 0}`}
          </p>
        )}
      </div>

      {/* Cancelled */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Cancelled</span>
        </div>
        {isLoading ? (
          <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
        ) : (
          <p className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
            {percentageData.cancelled > 0 ? `${percentageData.cancelled.toFixed(1)}%` : `${attendanceHealth?.cancelled || 0}`}
          </p>
        )}
      </div>

      {/* No Show */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">No Show</span>
        </div>
        {isLoading ? (
          <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
        ) : (
          <p className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">
            {percentageData.noShow > 0 ? `${percentageData.noShow.toFixed(1)}%` : `${attendanceHealth?.noShow || 0}`}
          </p>
        )}
      </div>
    </div>
  );
}