import { useAuthStore } from '@/stores/auth.store'
import { UserBarProps } from '@/lib/interface/interface';

import CodeDisplay from "./code-display";
import NotificationComp from "./notification";
import UserIcon from "./user-icon";
import Welcomeback from "./welcome";

export default function UserBar({ isOpen, isSmallDisplay }: UserBarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <div className={`fixed w-full`}>
      <nav className={`w-full dark:bg-main-background bg-light-main-background flex ${!isSmallDisplay
      ? isOpen
        ? "translate-x-70 justify-between"
        : "translate-x-23 justify-between"
      : 'justify-end'} py-5 transition-transform duration-300`}>

        {!isSmallDisplay && <Welcomeback isOpen={isOpen} user={user}></Welcomeback>}

        <div className={`flex items-center sm:gap-2 gap-1 ${!isSmallDisplay
          ? isOpen
            ? "-translate-x-75 justify-between"
            : "-translate-x-28 justify-between"
          : 'justify-end'}}`}>
          <CodeDisplay />

          <NotificationComp />
          
          <UserIcon user={user} isSmallDisplay={isSmallDisplay} />
        </div>
      </nav>
    </div>
  )
}