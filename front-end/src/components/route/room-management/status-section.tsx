import { StatusSectionProps } from "@/utils/interface/interface";

export default function StatusSection({ rooms }: StatusSectionProps) {
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(r => r.isActive === 'active').length;
  const maintenanceRooms = rooms.filter(r => r.isActive === 'maintenance').length;
  const activeRate = totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0;
  const maintenanceRate = totalRooms > 0 ? Math.round((maintenanceRooms / totalRooms) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
      <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar p-6 rounded-2xl shadow-sm dark:shadow-none">
        <p className="text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold mb-4">Total Rooms</p>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-light-main dark:text-main">{totalRooms.toString().padStart(2, '0')}</span>
          <span className="text-xs font-bold bg-light-purple dark:bg-hover text-dark-purple dark:text-muted px-2.5 py-1 rounded-full">Spaces</span>
        </div>
      </div>
      
      <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar p-6 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
        <p className="text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold mb-4">Operational Rate</p>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-4xl font-bold text-light-main dark:text-main">{activeRooms.toString().padStart(2, '0')}</span>
          <span className="text-xs font-bold text-success tracking-wider">{activeRate}% ACTIVE</span>
        </div>
        <div className="w-full h-0.5 bg-light-purple dark:bg-hover relative rounded-full">
          {/* 1. แถบสีวิ่ง (Fill) */}
          <div 
            className="absolute top-0 left-0 h-full bg-success rounded-full transition-all duration-500" 
            style={{ width: `${activeRate}%` }} 
          />
          {/* 2. จุดวงกลมเรืองแสง (Indicator) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-success shadow-[0_0_8px_var(--color-success)] transition-all duration-500" 
            style={{ left: `calc(${activeRate}% - 4px)` }} 
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 dark:border-none dark:bg-sidebar p-6 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
        <p className="text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold mb-4">Maintenance</p>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-4xl font-bold text-light-main dark:text-main">{maintenanceRooms.toString().padStart(2, '0')}</span>
          <span className="text-xs font-bold text-danger tracking-wider">{maintenanceRate}% MAINTENANCE</span>
        </div>
        <div className="w-full h-0.5 bg-light-purple dark:bg-hover relative rounded-full">
            {/* 1. แถบสีวิ่ง (Fill) */}
            <div 
            className="absolute top-0 left-0 h-full bg-danger rounded-full transition-all duration-500" 
            style={{ width: `${maintenanceRate}%` }} 
          />
          {/* 2. จุดวงกลมเรืองแสง (Indicator) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-danger shadow-[0_0_8px_var(--color-danger)] transition-all duration-500" 
            style={{ left: `calc(${maintenanceRate}% - 4px)` }}
          />
        </div>
      </div>
    </div>
  )
}