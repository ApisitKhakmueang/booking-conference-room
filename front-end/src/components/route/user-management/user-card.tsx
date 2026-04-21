import { UserCardProps } from "@/utils/interface/interface";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserCard({ currentUsers, toggleStatus, updatingID }: UserCardProps) {
  const router = useRouter()

  const goToDetail = (userId: string) => {
    router.push(`/user-management/${userId}`); 
  }

  return (
    <>
      {currentUsers.map((user) => {
        const isActive = user.status === 'active';

        const isUpdating = updatingID === user.id;
        
        const statusStyle = isActive
          ? { text: 'text-success', toggleBg: 'bg-success', dot: 'bg-success shadow-[0_0_8px_var(--color-success)]', ring: 'border-white dark:border-sidebar' }
          : { text: 'text-gray-400 dark:text-gray-500', toggleBg: 'bg-gray-300 dark:bg-gray-700', dot: 'bg-gray-400', ring: 'border-white dark:border-sidebar' };

        return (
          <div key={user.id} className="relative flex flex-col md:flex-row md:items-center p-4 md:p-5 bg-white border border-gray-100 hover:bg-light-purple shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar dark:hover:bg-hover transition-all duration-300 group rounded-2xl">
            
            {/* 1. Member Name & Avatar (w-[35%]) */}
            <div className="flex items-center gap-4 w-full md:w-[35%] pr-8 md:pr-0">
              <div className="relative">
                <img src={user.avatarUrl || "https://via.placeholder.com/150"} alt={user.fullName} className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-800" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusStyle.dot}`}></div>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-light-main dark:text-main font-bold text-base tracking-wide leading-none">
                  {user.fullName}
                </h3>
                <div className="flex items-center gap-1.5 text-light-secondary dark:text-secondary text-xs uppercase tracking-widest font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {user.role || 'MEMBER'}
                </div>
              </div>
            </div>

            {/* 2. Identity (Email) (w-[35%]) */}
            <div className="w-full md:w-[35%] flex items-center border-t border-gray-100 dark:border-white/5 md:border-none pt-3 md:pt-0 mt-3 md:mt-0">
              <span className="text-light-main dark:text-main text-sm font-medium truncate">
                {user.email}
              </span>
            </div>

            {/* 3. Status Badge / Toggle (w-[20%]) */}
            {/* บนมือถือจับแยกให้อยู่คนละฝั่ง (justify-between) แต่จอใหญ่ให้ชิดซ้ายปกติ (md:justify-start) */}
            <div className="w-full md:w-[20%] flex justify-between md:justify-start items-center pt-3 md:pt-0 border-t border-gray-100 dark:border-white/5 md:border-none mt-3 md:mt-0">
              <span className="md:hidden text-xs font-bold uppercase text-light-secondary dark:text-secondary tracking-widest">
                Status
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleStatus(user.id, user.status as 'active' | 'inactive'); }} 
                  disabled={isUpdating}
                  className={`w-10 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${statusStyle.toggleBg} ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
                <span className={`text-xs font-bold uppercase tracking-widest ${statusStyle.text}`}>
                  {user.status}
                </span>
              </div>
            </div>

            {/* 4. Action (w-[10%]) */}
            {/* บนมือถือจะลอยอยู่มุมขวาบน แต่จอคอมจะอยู่ในคอลัมน์ขวาสุดอย่างสวยงาม */}
            <div className="absolute top-3 right-3 md:relative md:top-auto md:right-auto flex justify-end md:w-[10%]">
              <button 
                onClick={(e) => { e.stopPropagation(); goToDetail(user.id); }}
                className="text-light-secondary dark:text-secondary bg-transparent hover:text-dark-purple dark:hover:text-white transition-colors p-2 rounded-lg cursor-pointer md:pr-6">
                <Eye className="w-5 h-5" />
              </button>
            </div>

          </div>
        );
      })}
    </>
  )
}

export function UserCardSkeleton() {
  return (
    <>
      {/* วนลูปสร้าง Skeleton จำลอง 5 อัน */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div 
          key={index} 
          className="relative flex flex-col md:flex-row md:items-center p-4 md:p-5 bg-white border border-gray-100 shadow-sm dark:shadow-none dark:border-none dark:bg-sidebar rounded-2xl animate-pulse"
        >
          
          {/* 1. Member Name & Avatar Skeleton */}
          <div className="flex items-center gap-4 w-full md:w-[35%] pr-8 md:pr-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0"></div>
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-md"></div>
              <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded-md"></div>
            </div>
          </div>

          {/* 2. Identity (Email) Skeleton */}
          <div className="w-full md:w-[35%] flex items-center pt-3 md:pt-0 mt-3 md:mt-0">
            <div className="h-4 w-48 bg-slate-200 dark:bg-white/10 rounded-md"></div>
          </div>

          {/* 3. Status Badge / Toggle Skeleton */}
          <div className="w-full md:w-[20%] flex justify-between md:justify-start items-center pt-3 md:pt-0 mt-3 md:mt-0">
            <div className="md:hidden h-3 w-12 bg-slate-200 dark:bg-white/10 rounded-md"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-white/10"></div>
              <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-md hidden md:block"></div>
            </div>
          </div>

          {/* 4. Action Skeleton */}
          <div className="absolute top-3 right-3 md:relative md:top-auto md:right-auto flex justify-end md:w-[10%]">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 md:mr-4"></div>
          </div>

        </div>
      ))}
    </>
  );
}