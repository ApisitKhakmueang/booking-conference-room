import { UserResponse } from "@/utils/interface/response";

export default function ProfileHeader({ user }: {user:UserResponse}) {
  const isUserActive = user.status === 'active';

  return (
    <div className="flex items-center gap-5">
      <img src={user.avatarUrl} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-white/5" alt="profile" />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-light-main dark:text-main leading-tight">{user.fullName}</h1>
        <p className="text-sm font-medium text-light-secondary dark:text-secondary">{user.email}</p>
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit mt-1 ${isUserActive ? 'bg-success/10' : 'bg-gray-500/10'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-success shadow-[0_0_8px_var(--color-success)]' : 'bg-gray-500'}`}></div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isUserActive ? 'text-success' : 'text-gray-500'}`}>{user.status}</span>
        </div>
      </div>
    </div>
  )
}