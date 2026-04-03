import { OccupyModalProps } from "@/utils/interface/interface";
import { MonitorX } from "lucide-react";

export default function OccupyModal({ setIsOccupyModalOpen, selectedBooking }: OccupyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* พื้นหลังเบลอ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOccupyModalOpen(false)}
      ></div>
      
      {/* กล่องรายละเอียด */}
      <div className="relative bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 border dark:border-sidebar">
        <div className="bg-rose-500 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MonitorX size={20} />
            Room Occupied
          </h3>
          <button onClick={() => setIsOccupyModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full cursor-pointer transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-gray-700 dark:text-gray-200">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Meeting Title</p>
            <p className="font-semibold text-lg">{selectedBooking.title || "Untitled Meeting"}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Time</p>
              <p className="font-medium">
                {new Date(selectedBooking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">End Time</p>
              <p className="font-medium">
                {new Date(selectedBooking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
          
          {/* ถ้าใน BookingEventResponse ของคุณมีชื่อคนจอง ให้เอามาใส่ตรงนี้ได้เลยครับ */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Booked by</p>
            <p className="font-medium">{selectedBooking.User?.fullName}</p>
          </div> 
          
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-sidebar/50 border-t dark:border-sidebar flex justify-end">
          <button 
            onClick={() => setIsOccupyModalOpen(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-sidebar hover:bg-gray-300 dark:hover:bg-white/10 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}