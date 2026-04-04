import { Card } from "@/components/ui/card";
import { BookingEvent } from "@/utils/interface/interface";

export default function OverviewCard({ events } : { events?: BookingEvent[]}) {
  return (
    <div className="w-[222px] hidden xl:block">
      <Card loading={false} className="py-0 border bg-light-sidebar border-dark-purple/30 shadow-sm dark:bg-sidebar dark:border-transparent duration-0 w-full overflow-hidden rounded-none">
        <div className="flex flex-col gap-5 p-5">
          {/* 1. Main Header: Total */}
          <div className="space-y-1">
            <h1 className="text-start font-semibold text-sm text-dark-purple dark:text-white uppercase tracking-widest">
              Total Bookings
            </h1>
            <p className="text-5xl text-dark-purple dark:text-white">
              {events?.length}
            </p>
          </div>

          <hr className="border-dark-purple/10 dark:border-white/5" />

          {/* 2. Sub Stats: Completed & Cancelled */}
          <div className="space-y-4">
            
            {/* --- Section: Completed --- */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end text-[11px] font-bold uppercase tracking-wider">
                <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                <span className="text-dark-purple dark:text-white">
                  {events?.filter(e => e.status === 'Completed').length} 
                  ({events && events.length > 0 ? Math.round((events.filter(e => e.status === 'Completed').length / events.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-dark-purple/10 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                  style={{ width: events && events.length > 0 ? `${(events.filter(e => e.status === 'Completed').length / events.length) * 100}%` : '0%' }} 
                />
              </div>
            </div>

            {/* --- Section: Cancelled --- */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end text-[11px] font-bold uppercase tracking-wider">
                <span className="text-rose-600 dark:text-rose-400">Cancelled</span>
                <span className="text-dark-purple dark:text-white">
                  {events?.filter(e => e.status === 'Cancelled').length} 
                  ({events && events.length > 0 ? Math.round((events.filter(e => e.status === 'Cancelled').length / events.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-dark-purple/10 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" 
                  style={{ width: events && events.length > 0 ? `${(events.filter(e => e.status === 'Cancelled').length / events.length) * 100}%` : '0%' }} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end text-[11px] font-bold uppercase tracking-wider">
                <span className="text-orange-600 dark:text-orange-400">No Show</span>
                <span className="text-dark-purple dark:text-white">
                  {events?.filter(e => e.status === 'No Show').length} 
                  ({events && events.length > 0 ? Math.round((events.filter(e => e.status === 'No Show').length / events.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-dark-purple/10 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" 
                  style={{ width: events && events.length > 0 ? `${(events.filter(e => e.status === 'No Show').length / events.length) * 100}%` : '0%' }} 
                />
              </div>
            </div>


          </div>

          {/* 3. Footer Hint */}
          <p className="text-[10px] text-right text-dark-purple/40 dark:text-white/30 italic">
            * Monthly Overview
          </p>
        </div>
      </Card>
    </div>
  )
}