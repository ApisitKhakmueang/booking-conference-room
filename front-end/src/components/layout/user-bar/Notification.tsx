import { Bell } from 'lucide-react';

export default function NotificationComp() {
  return (
    <div className='flex'>
      <div className='rounded-full cursor-pointer relative p-3.5 bg-slate-50 text-black hover:bg-slate-200 border border-slate-400 hover:-translate-y-1 transition-duration-300 dark:bg-sidebar dark:text-main dark:border-none dark:hover:bg-hover'>
        <Bell size={24}/>

        <div className='absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full -mt-1 -mr-1'>
          3
        </div>
      </div>
    </div>
  )
}