const tabs = ["ALL", "COMPLETED", "CANCELLED", "NO SHOW"];

export default function ActiveTab({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="xs:flex hidden items-center xs:gap-8 gap-5 border-b border-gray-100 dark:border-white/10 px-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative py-4 text-sm font-bold tracking-widest transition-all duration-300 cursor-pointer
            ${
              activeTab === tab
                ? "text-dark-purple dark:text-purple-400" // สีตอนเลือก (อ้างอิงจากสีม่วงในรูป)
                : "hover:text-white" // สีตอนไม่ได้เลือก
            }`}
        >
          {tab}
          
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-dark-purple dark:bg-purple-400 transition-all duration-300" />
          )}
        </button>
      ))}
    </div>
  )
}