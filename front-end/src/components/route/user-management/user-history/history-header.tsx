export default function HistoryHeader() {
  return (
    <div className="hidden md:flex items-center px-5 mb-4 text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold">
      <div className="w-[20%]">Date</div>
      <div className="w-[35%]">Time & Duration</div>
      <div className="w-[35%]">Room</div>
      <div className="w-[10%]">Status</div>
    </div>
  )
}