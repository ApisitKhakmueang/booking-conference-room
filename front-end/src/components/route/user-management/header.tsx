export default function Header() {
  return (
    <div className="hidden md:flex items-center px-5 mb-4 text-xs text-light-secondary dark:text-secondary uppercase tracking-widest font-bold">
      <div className="w-[35%]">Member Name</div>
      <div className="w-[35%]">Identity</div>
      <div className="w-[20%]">Status</div>
      {/* pr-2 เพื่อให้ขอบขวาตรงกับปุ่ม 3 จุดพอดี */}
      <div className="w-[10%] text-right pr-2">Action</div> 
    </div>
  )
}