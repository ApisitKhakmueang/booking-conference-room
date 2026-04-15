import { ConfigProps } from "@/utils/interface/interface";
import { Hourglass } from "lucide-react";

export default function MaxBookingMins({ config, setConfig }: ConfigProps) {
  // คำนวณ % ของ Slider (Min 1, Max 5 -> Range = 4)
  const durationPercent = ((Number(config.maxBookingMins) || 1) - 1) / 4 * 100;

  return (
    <div className="bg-white dark:bg-sidebar border border-gray-100 dark:border-none shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-none p-6 rounded-2xl lg:col-span-3 relative overflow-hidden flex flex-col justify-between transition-colors">
      <Hourglass className="absolute md:flex hidden right-6 top-6 w-16 h-16 text-light-secondary/10 dark:text-white/5" strokeWidth={1} />
      <div>
        <h3 className="text-2xl font-semibold mb-1 text-light-main dark:text-main">Booking Duration Limits</h3>
        <p className="text-sm text-light-secondary dark:text-secondary mb-8">Define the maximum temporal footprint of a single engagement.</p>
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-4">
          <input 
            type="number" min="1" max="5" step="0.5" 
            value={config.maxBookingMins}
            onChange={(e) => {
              let val = parseFloat(e.target.value); 
              if (val > 5) val = 5;
              setConfig({...config, maxBookingMins: isNaN(val) ? ('' as any) : val});
            }}
            onBlur={() => {
              // ถ้าลบจนว่าง หรือใส่น้อยกว่า 1 ตอนคลิกออกจะบังคับเป็น 1
              let val = parseFloat(config.maxBookingMins as any);
              if (isNaN(val) || val < 1) val = 1;
              val = Math.round(val * 2) / 2;
              setConfig({...config, maxBookingMins: val});
            }}
            className="text-4xl font-bold bg-transparent outline-none md:w-20 w-10 text-light-main dark:text-main border-b-2 border-transparent focus:border-dark-purple/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sm text-light-secondary dark:text-secondary">hours</span>
          <span className="ml-auto text-[10px] text-light-secondary dark:text-secondary tracking-widest uppercase font-semibold">Max Capacity</span>
        </div>
        
        {/* Slider 1-5 Hours */}
        <div className="relative w-full h-[3px] bg-gray-200 dark:bg-card rounded-full mb-3">
          <div className="absolute h-full bg-dark-purple rounded-full transition-all duration-200" style={{ width: `${durationPercent}%` }} />
          <input type="range" min="1" max="5" step="0.5" value={config.maxBookingMins || 1}
            onChange={(e) => setConfig({...config, maxBookingMins: parseFloat(e.target.value)})}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-dark-purple rounded-full shadow-[0_0_8px_var(--color-dark-purple)] transition-all duration-200 pointer-events-none" style={{ left: `calc(${durationPercent}% - 7px)` }} />
        </div>
        <div className="flex justify-between text-xs text-light-secondary dark:text-secondary font-bold tracking-wider">
          {[1, 2, 3, 4, 5].map((number) => (
            <span key={number}>
              {number}&nbsp;
              <span className="sm:inline-block hidden">HOUR</span>
            </span>
          ))}
          {/* <span>1 HOUR</span><span>2 HOURS</span><span>3 HOURS</span><span>4 HOURS</span><span>5 HOURS</span> */}
        </div>
      </div>
    </div>
  )
}