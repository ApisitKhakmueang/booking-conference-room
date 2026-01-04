import { useAuthStore } from '@/stores/auth.store'
import { UserBarProps } from '@/lib/interface/interface';

import CodeDisplay from "./code-display";
import NotificationComp from "./notification";
import UserIcon from "./user-icon";
import Welcomeback from "./welcome";

export default function UserBar({ isOpen, isMobile }: UserBarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <div className={`fixed w-full`}>
      <nav className={`w-full dark:bg-main-background bg-white flex ${!isMobile
      ? isOpen
        ? "pl-70 justify-between"
        : "pl-23 justify-between"
      : 'justify-end'} p-5  transition-duration-300`}>

        {!isMobile && <Welcomeback isOpen={isOpen} user={user}></Welcomeback>}

        <div className="flex items-center sm:gap-2 gap-1">
          <CodeDisplay />

          <NotificationComp />
          
          <UserIcon user={user} isMobile={isMobile} />
        </div>
      </nav>
    </div>
  )
}