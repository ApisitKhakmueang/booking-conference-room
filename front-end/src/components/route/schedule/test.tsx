export function Test() {
  return (
    <main className="flex min-h-screen bg-neutral-950">
      
      <section className="flex-1 p-8 overflow-y-auto">
        <div className="flex mb-8">
          <header>
            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-100 mb-2">Daily Schedule</h2>
            <p className="text-purple-300">Tuesday, October 24th, 2023</p>
          </header>
        </div>

        <div className="space-y-4">
          
          <div className="group flex gap-6 p-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-all duration-300">
            <div className="w-20 pt-1 text-right border-r border-white/10 pr-6">
              <span className="block font-bold text-lg text-neutral-100">09:00</span>
              <span className="block text-[10px] text-stone-500 uppercase">AM</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">Conference A</span>
                <div className="flex -space-x-2">
                  <img alt="Guest 1" className="w-6 h-6 rounded-full border-2 border-neutral-900" src="https://ui-avatars.com/api/?name=Guest+1&background=random" />
                  <img alt="Guest 2" className="w-6 h-6 rounded-full border-2 border-neutral-900" src="https://ui-avatars.com/api/?name=Guest+2&background=random" />
                  <div className="w-6 h-6 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center text-[8px] text-stone-400">+4</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-100 mb-1">Executive Board Meeting</h3>
              <p className="text-sm text-stone-400">Quarterly performance review and strategic planning.</p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> Confirmed
                </span>
                <span className="text-stone-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 120 min
                </span>
              </div>
            </div>
          </div>

          <div className="group flex gap-6 p-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-all duration-300">
            <div className="w-20 pt-1 text-right border-r border-white/10 pr-6">
              <span className="block font-bold text-lg text-neutral-100">11:30</span>
              <span className="block text-[10px] text-stone-500 uppercase">AM</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Suite 402</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-100 mb-1">VIP Private Luncheon</h3>
              <p className="text-sm text-stone-400">Host: Sarah Jenkins. Custom catering requirements attached.</p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> Confirmed
                </span>
                <span className="text-stone-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 90 min
                </span>
              </div>
            </div>
          </div>

          <div className="group flex gap-6 p-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-all duration-300">
            <div className="w-20 pt-1 text-right border-r border-white/10 pr-6">
              <span className="block font-bold text-lg text-neutral-100">02:00</span>
              <span className="block text-[10px] text-stone-500 uppercase">PM</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-widest">Lounge West</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-100 mb-1">Tech Founders Meetup</h3>
              <p className="text-sm text-stone-400">Informal networking session for local entrepreneurs.</p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span> Pending
                </span>
                <span className="text-stone-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 60 min
                </span>
              </div>
            </div>
          </div>

          <div className="group flex gap-6 p-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-all duration-300">
            <div className="w-20 pt-1 text-right border-r border-white/10 pr-6">
              <span className="block font-bold text-lg text-neutral-100">04:30</span>
              <span className="block text-[10px] text-stone-500 uppercase">PM</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">Conference B</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-100 mb-1">Design Review: Project Velvet</h3>
              <p className="text-sm text-stone-400">Presentation of initial UI prototypes and brand strategy.</p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> Confirmed
                </span>
                <span className="text-stone-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 45 min
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <aside className="w-80 border-l border-white/10 bg-[#171717] p-8 space-y-10">
        
        <div>
          <h4 className="text-sm font-bold text-stone-300 mb-6 uppercase tracking-widest flex items-center justify-between">
            October 2023
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-lg cursor-pointer hover:text-purple-400">chevron_left</span>
              <span className="material-symbols-outlined text-lg cursor-pointer hover:text-purple-400">chevron_right</span>
            </div>
          </h4>
          <div className="grid grid-cols-7 gap-y-4 text-center">
            <span className="text-[10px] font-bold text-stone-600">S</span>
            <span className="text-[10px] font-bold text-stone-600">M</span>
            <span className="text-[10px] font-bold text-stone-600">T</span>
            <span className="text-[10px] font-bold text-stone-600">W</span>
            <span className="text-[10px] font-bold text-stone-600">T</span>
            <span className="text-[10px] font-bold text-stone-600">F</span>
            <span className="text-[10px] font-bold text-stone-600">S</span>
            
            <span className="text-xs text-stone-600">1</span><span className="text-xs text-stone-600">2</span><span className="text-xs text-stone-600">3</span><span className="text-xs text-stone-600">4</span><span className="text-xs text-stone-600">5</span><span className="text-xs text-stone-600">6</span><span className="text-xs text-stone-600">7</span>
            <span className="text-xs text-stone-600">8</span><span className="text-xs text-stone-600">9</span><span className="text-xs text-stone-600">10</span><span className="text-xs text-stone-600">11</span><span className="text-xs text-stone-600">12</span><span className="text-xs text-stone-600">13</span><span className="text-xs text-stone-600">14</span>
            <span className="text-xs text-stone-600">15</span><span className="text-xs text-stone-600">16</span><span className="text-xs text-stone-600">17</span><span className="text-xs text-stone-600">18</span><span className="text-xs text-stone-600">19</span><span className="text-xs text-stone-600">20</span><span className="text-xs text-stone-600">21</span>
            <span className="text-xs text-stone-600">22</span><span className="text-xs text-stone-600">23</span>
            
            <span className="text-xs w-7 h-7 flex items-center justify-center bg-purple-500 text-white font-bold rounded-lg mx-auto shadow-[0_0_15px_rgba(168,85,247,0.4)]">24</span>
            
            <span className="text-xs text-neutral-100">25</span><span className="text-xs text-neutral-100">26</span><span className="text-xs text-neutral-100">27</span><span className="text-xs text-neutral-100">28</span>
            <span className="text-xs text-neutral-100">29</span><span className="text-xs text-neutral-100">30</span><span className="text-xs text-neutral-100">31</span>
          </div>
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
    </main>
  )
}