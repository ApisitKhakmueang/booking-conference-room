
const tabs = ["ALL", "COMPLETED", "CANCELLED", "NO SHOW"];

export function StatusFilter({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab:string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-bold text-gray-800 dark:text-stone-300 uppercase tracking-widest">
        Booking Status
      </span>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-widest transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-dark-purple/80 hover:bg-dark-purple text-white shadow-md"
                : "bg-gray-100 dark:bg-white/5 text-light-secondary dark:text-gray-400 hover:bg-light-purple dark:hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}