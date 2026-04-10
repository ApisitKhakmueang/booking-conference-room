import { Plus } from 'lucide-react';

export default function QuickBookCard({ handleAddClick }: { handleAddClick: (open: boolean) => void }) {
  return (
    <div 
      onClick={() => handleAddClick(true)}
      className="flex-1 bg-linear-to-br from-dark-purple/70 to-dark-purple dark:from-dark-purple dark:to-dark-purple/70 rounded-2xl p-8 shadow-xl shadow-[#8370ff]/20 flex flex-col items-center justify-center text-center cursor-pointer hover:brightness-110 hover:-translate-y-1 transition-all group">
      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
        <Plus className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Quick Book</h3>
      <p className="text-white/80 font-medium">Secure a room in seconds</p>
    </div>
  )
}