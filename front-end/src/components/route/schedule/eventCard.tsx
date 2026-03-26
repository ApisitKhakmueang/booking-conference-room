import { Button } from "@/components/ui/button";
import { EventCardProps } from "@/utils/interface/interface";
import { formatTimeWithSuffix } from "@/utils/time";
import { format } from "date-fns";
import { X } from "lucide-react";

export default function CardEvents({ event, setIsAddModalOpen, setCurrentDate } : EventCardProps) {
  const eventDate = new Date(event.date)
  const formattedDate = event.date ? format(eventDate, 'EEEE, dd MMM yyyy') : '';
  const start = formatTimeWithSuffix(event.startTime)
  const end = formatTimeWithSuffix(event.endTime)

  return (
    <div 
      onClick={() => {
        setIsAddModalOpen(true)
        setCurrentDate(eventDate)
      }}
      className="group flex gap-6 p-6 rounded-2xl dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 cursor-pointer">
      <div className="w-20 pt-1 text-right border-r border-white/10 pr-6">
        <span className="block font-bold text-lg text-neutral-100">{start.time}</span>
        <span className="block text-[12px] text-stone-500 uppercase">{start.suffix}</span>
        <span className="block text-[10px] text-stone-500 uppercase">to</span>
        <span className="block font-bold text-lg text-neutral-100">{end.time}</span>
        <span className="block text-[12px] text-stone-500 uppercase">{end.suffix}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">{event?.room?.name}</span>

          <Button className="p-1.5 bg-transparent dark:hover:bg-hover hover:text-gray-500">
            <X />
          </Button>
        </div>
        <h3 className="text-xl font-bold text-neutral-100 mb-1">{event.title}</h3>
        <p className="text-sm text-stone-400">{formattedDate}</p>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> {event.status}
          </span>
          <span className="text-stone-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span> {event.duration}
          </span>
        </div>
      </div>
    </div>
  )
}