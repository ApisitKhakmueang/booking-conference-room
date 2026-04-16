import { ConfigProps } from "@/utils/interface/interface";
import { Hand } from "lucide-react";

export default function LateArrivalPolicy({ config, setConfig, isOpenEdit }: ConfigProps) {
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberChange = () => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
    // 🌟 จัดการค่าและอัปเดต formData ที่นี่
    let val = parseInt(e.target.value);
    
    // ถ้าผู้ใช้กดลบจนช่องว่างเปล่า
    if (isNaN(val)) {
      setConfig({ ...config, noShowThresholdMins: '' as any }); // อนุญาตให้ว่างชั่วคราวได้
      return;
    }

    // ดักไม่ให้เกิน 15 และไม่ต่ำกว่า 0
    if (val > 15) val = 15;
    if (val < 0) val = 0;

    // อัปเดตค่าที่ถูกต้องลง formData
    setConfig({ ...config, noShowThresholdMins: val });
  };

  return (
    <div className="bg-white dark:bg-sidebar border border-gray-100 dark:border-none shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-none p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between transition-colors">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center border border-danger/20 shrink-0">
          <Hand className="text-danger w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-1 text-light-main dark:text-main">Late Arrival Policy</h3>
          <p className="text-sm text-light-secondary dark:text-secondary leading-relaxed">Grace period before auto-cancellation.</p>
        </div>
      </div>
      <div className="bg-light-purple dark:bg-card rounded-xl p-3 flex items-center gap-4 border border-transparent w-full transition-colors focus-within:border-dark-purple focus-within:ring-1 focus-within:ring-dark-purple flex-1">
        <input 
          disabled={!isOpenEdit}
          type="number" 
          value={config.noShowThresholdMins} 
          onKeyDown={handleNumberKeyDown}
          onChange={handleNumberChange}
          className="w-16 bg-white dark:bg-card text-center p-2 rounded-lg outline-none font-bold text-light-main dark:text-main text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors disabled:opacity-50" />
        <span className="text-sm text-light-secondary dark:text-secondary font-medium pr-2">Minutes Grace Period</span>
      </div>
    </div>
  )
}