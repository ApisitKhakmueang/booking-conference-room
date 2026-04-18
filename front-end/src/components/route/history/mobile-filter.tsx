import { Button } from "@/components/ui/button"
import { BookingEvent } from "@/utils/interface/interface"
import DesktopSidebar from "./desktop-sidebar"
import { StatusFilter } from "./status-filter"

interface MobileFilterProps {
  setIsMobileFilterOpen: (val: boolean) => void,
  currentDate: Date,
  setCurrentDate: (date: Date) => void,
  filteredEvents: BookingEvent[] | undefined,
  selectedRooms: number[],
  setSelectedRooms: React.Dispatch<React.SetStateAction<number[]>>
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function MobileFilter({ setIsMobileFilterOpen, currentDate, setCurrentDate, filteredEvents, selectedRooms, setSelectedRooms,activeTab, setActiveTab }: MobileFilterProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-end bg-black/50 xl:hidden">
      <div className="w-full max-h-[85vh] flex flex-col bg-light-main-background dark:bg-card rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-end items-center shrink-0">
          <button 
            className="text-gray-500 hover:text-white"
            onClick={() => {
              setIsMobileFilterOpen(false)
              }}>✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <DesktopSidebar 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            events={filteredEvents} 
            className="flex xs:flex-row flex-col w-full border-none space-y-6 lg:px-60 md:px-40 gap-5"
            selectedRooms={selectedRooms}       // 🌟 ส่ง State ลงไปใน Mobile ด้วย
            setSelectedRooms={setSelectedRooms} 
          />

          {/* 🌟 2. เพิ่มส่วนเลือก Status Filter */}
          <StatusFilter activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <Button 
          className="w-full shrink-0 py-3 mt-4 bg-dark-purple/80 hover:bg-dark-purple text-white rounded-xl font-medium"
          onClick={() => setIsMobileFilterOpen(false)}>
          Show Results
        </Button>
      </div>
    </div>
  )
}