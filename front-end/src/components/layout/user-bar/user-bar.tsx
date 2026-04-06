import { useAuthStore } from '@/stores/auth.store'

import CodeDisplay from "./code-display";
import NotificationComp from "./notification";
import { UserIcon, UserIconSkeleton } from "./user-icon";
import Welcomeback from "./welcome";
import { useControlLayoutStore } from '@/stores/control-layout.store';
import { useShallow } from 'zustand/shallow';
import ThemeButton from '@/components/utils/theme-button';

export default function UserBar() {
  const { isOpenNav, isHideNav } = useControlLayoutStore(
    useShallow(((state) => ({
      isOpenNav: state.isOpenNav,
      isHideNav: state.isHideNav
    })))
  )
  const user = useAuthStore((s) => s.user)

  return (
    <div className='fixed w-full z-30'>
      <nav className={`w-full dark:bg-main-background bg-light-main-background flex ${!isHideNav
      ? isOpenNav
        ? "translate-x-70 justify-between"
        : "translate-x-23 justify-between"
      : 'justify-end px-5'} py-5 transition-transform duration-300`}>

        {!isHideNav && <Welcomeback isOpenNav={isOpenNav} user={user}></Welcomeback>}

        <div className={`flex items-center sm:gap-2 gap-1 ${!isHideNav
          ? isOpenNav
            ? "-translate-x-75 justify-between"
            : "-translate-x-28 justify-between"
          : 'justify-end'}}`}>

          <ThemeButton className='p-0' />
          
          {!user ? (
            // ถ้า user ยังเป็น null (กำลังโหลด) ให้โชว์ Skeleton
            <UserIconSkeleton isHideNav={isHideNav} />
          ) : (
            // ถ้า user มีข้อมูลแล้ว ให้โชว์ของจริง
            <UserIcon user={user} isHideNav={isHideNav} />
          )}
        </div>
      </nav>
    </div>
  )
}