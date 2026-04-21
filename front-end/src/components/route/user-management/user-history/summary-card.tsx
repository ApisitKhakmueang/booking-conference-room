import { SummaryCardProps } from '@/utils/interface/interface';
import { Calendar, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

export default function SummaryCard({ statistics }: SummaryCardProps) {
  const statisticsObject = useMemo(() => {
    return [
      { label: 'Upcoming', val: statistics?.upcoming || 0, icon: Calendar, color: 'text-dark-purple dark:text-purple-400' },
      { label: 'Completed', val: statistics?.completed || 0, icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400' },
      { label: 'Cancelled', val: statistics?.cancelled || 0, icon: XCircle, color: 'text-rose-500 dark:text-rose-400' },
      { label: 'No-Show', val: statistics?.noShow || 0, icon: AlertTriangle, color: 'text-orange-500 dark:text-orange-400' },
    ]
  }, [statistics])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statisticsObject.map((item, i) => (
        <div key={i} className="bg-white dark:bg-sidebar border border-gray-100 dark:border-none p-5 rounded-2xl shadow-sm">
          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2 ${item.color}`}>
            <item.icon className="w-3.5 h-3.5" /> {item.label}
          </div>
          <div className="text-3xl font-black text-light-main dark:text-main">{item.val}</div>
        </div>
      ))}
    </div>
  )
}

export function SummaryCardSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-sidebar border border-gray-100 dark:border-none p-5 rounded-2xl shadow-sm animate-pulse"
        >
          {/* Header (Icon + Label) */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-white/10 shrink-0"></div>
            <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-md"></div>
          </div>
          {/* Number */}
          <div className="h-8 w-12 bg-slate-200 dark:bg-white/10 rounded-md mt-1"></div>
        </div>
      ))}
    </div>
  );
}