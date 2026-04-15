import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" 
import { ConfigProps } from "@/utils/interface/interface"

export default function AdvancedWindow({ config, setConfig }: ConfigProps) {
  return (
    <div className="bg-white dark:bg-sidebar border border-gray-100 dark:border-none shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-none p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between gap-3 transition-colors">
      <div>
        <h3 className="text-2xl font-semibold mb-1 text-light-main dark:text-main">Advance Window</h3>
        <p className="text-sm text-light-secondary dark:text-secondary leading-relaxed">How far ahead can clients secure their<br/>moments?</p>
      </div>
      
      <div>
        {/* Shadcn Select */}
        <Select 
          value={config.maxAdvanceDays.toString()} 
          onValueChange={(value) => setConfig({...config, maxAdvanceDays: Number(value)})}
        >
          <SelectTrigger className="w-full bg-light-purple dark:bg-card border-transparent dark:border-none h-[58px] rounded-lg text-light-main dark:text-main focus:border-dark-purple focus:ring-1 focus:ring-dark-purple transition-colors">
            <SelectValue placeholder="Select days" />
          </SelectTrigger>
          
          <SelectContent className="bg-white dark:bg-card border-gray-100 dark:border-hover text-light-main dark:text-main">
            {[15, 30, 45, 60].map((day) => (
              <SelectItem 
                key={day} 
                value={day.toString()}
                className="focus:bg-light-purple dark:focus:bg-hover cursor-pointer"
              >
                {day} Days Advance
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
      </div>
      <p className="text-xs text-light-secondary dark:text-secondary italic text-center sm:text-left">Recommended: 30 Days for optimal resource utilization.</p>
    </div>
  )
}