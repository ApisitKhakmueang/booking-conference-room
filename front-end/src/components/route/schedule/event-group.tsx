import { RenderEventGroupProps } from "@/utils/interface/interface";
import CardEvents from "./event-card";

export function RenderEventGroup({ title, groupEvents, titleColor, handleEditClick, setIsAddModalOpen, setCurrentDate, fetchUserBookings }: RenderEventGroupProps) {
  if (groupEvents.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h3 className={`text-base font-bold tracking-wide uppercase ${titleColor}`}>
          {title}
        </h3>
        
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-xs font-medium">
          {groupEvents.length}
        </span>
        
        {/* <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div> */}
      </div>
      <div className="space-y-4">
        {groupEvents.map(event => (
          <div key={event.id} onClick={() => handleEditClick(event)}>
            <CardEvents 
              event={event} 
              setIsAddModalOpen={setIsAddModalOpen} 
              setCurrentDate={setCurrentDate} 
              onDeleteSuccess={fetchUserBookings}
            />
          </div>
        ))}
      </div>
    </div>
  );
}