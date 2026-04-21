import { ConfigProps } from "@/utils/interface/interface";
import { Moon, Sun } from "lucide-react";

export default function DailyOperationalHours({ config, setConfig, isOpenEdit }: ConfigProps) {
  return (
    <div className="bg-white dark:bg-sidebar border border-gray-100 dark:border-none shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-none p-6 rounded-2xl lg:col-span-3 flex flex-col justify-between gap-6 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-2xl font-semibold mb-1 text-light-main dark:text-main">Daily Operational Hours</h3>
          <p className="text-sm text-light-secondary dark:text-secondary">Synchronize the concierge pulse across the<br/>week.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="bg-light-purple dark:bg-card border border-transparent p-4 rounded-xl flex-1 flex justify-between items-center group focus-within:border-dark-purple focus-within:ring-1 focus-within:ring-dark-purple transition-colors">
          <div>
            <p className="text-[9px] text-light-secondary dark:text-secondary tracking-widest font-bold mb-1">COMMENCEMENT</p>
            <input 
              disabled={!isOpenEdit} 
              type="time" value={config.startTime} 
              onChange={(e) => setConfig({...config, startTime: e.target.value})} 
              className="bg-transparent text-2xl font-bold outline-none text-light-main dark:text-main scheme-light dark:scheme-dark disabled:opacity-50" />
          </div>
          <Moon className="w-5 h-5 text-dark-purple" />
        </div>
        <div className="bg-light-purple dark:bg-card border border-transparent p-4 rounded-xl flex-1 flex justify-between items-center group focus-within:border-dark-purple focus-within:ring-1 focus-within:ring-dark-purple transition-colors">
          <div>
            <p className="text-[9px] text-light-secondary dark:text-secondary tracking-widest font-bold mb-1">CONCLUSION</p>
            <input 
              disabled={!isOpenEdit} 
              type="time" value={config.endTime} 
              onChange={(e) => setConfig({...config, endTime: e.target.value})} 
              className="bg-transparent text-2xl font-bold outline-none text-light-main dark:text-main scheme-light dark:scheme-dark disabled:opacity-50" />
          </div>
          <Sun className="w-5 h-5 text-dark-purple" />
        </div>
      </div>
    </div>
  )
}