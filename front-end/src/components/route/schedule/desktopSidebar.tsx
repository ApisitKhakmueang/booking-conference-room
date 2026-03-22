import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function DesktopSidebar() {
  const [date, setDate] = useState(new Date())

  return (
    <aside className="w-80 border-l border-white/10 px-8 space-y-10">
        
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => setDate(prev => ({ ...prev, date: d as Date }))}
            className="dark:bg-sidebar rounded-md"
            
            // 🌟 เพิ่มเงื่อนไข disabled ตรงนี้ครับ!
            disabled={(day) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาให้เป็นเที่ยงคืน จะได้เทียบแค่วันที่
              return day < today; // ถ้าวันนั้นน้อยกว่าวันนี้ ให้ปิดการใช้งาน
            }}/>
        </div>

        <div>
          <h4 className="text-sm font-bold text-stone-300 mb-4 uppercase tracking-widest">Filter Rooms</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 group cursor-pointer">
              <input checked className="w-4 h-4 rounded-sm border-none bg-neutral-800 text-purple-500 focus:ring-purple-500/20 transition-all" type="checkbox" />
              <span className="text-sm text-stone-400 group-hover:text-neutral-100 transition-colors">Conference A</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input checked className="w-4 h-4 rounded-sm border-none bg-neutral-800 text-purple-500 focus:ring-purple-500/20 transition-all" type="checkbox" />
              <span className="text-sm text-stone-400 group-hover:text-neutral-100 transition-colors">Conference B</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="w-4 h-4 rounded-sm border-none bg-neutral-800 text-purple-500 focus:ring-purple-500/20 transition-all" type="checkbox" />
              <span className="text-sm text-stone-400 group-hover:text-neutral-100 transition-colors">Suite 402</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input checked className="w-4 h-4 rounded-sm border-none bg-neutral-800 text-purple-500 focus:ring-purple-500/20 transition-all" type="checkbox" />
              <span className="text-sm text-stone-400 group-hover:text-neutral-100 transition-colors">Lounge West</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="w-4 h-4 rounded-sm border-none bg-neutral-800 text-purple-500 focus:ring-purple-500/20 transition-all" type="checkbox" />
              <span className="text-sm text-stone-400 group-hover:text-neutral-100 transition-colors">Executive Patio</span>
            </label>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border-t border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          
          <h4 className="text-xs font-bold text-stone-500 mb-4 uppercase tracking-widest relative z-10">Quick Stats</h4>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Total Bookings Today</p>
              <p className="text-3xl font-black text-neutral-100">12</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Busiest Room</p>
              <p className="text-lg font-bold text-purple-400">Conference A</p>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div className="w-3/4 h-full bg-purple-500"></div>
              </div>
            </div>
          </div>
        </div>

      </aside>
  );
}