// components/sidebar/SidebarToggle.tsx
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useControlLayoutStore } from "@/stores/control-layout.store";

export default function SidebarToggle() {
  const { isOpenNav, setIsOpenNav, isHideNav } = useControlLayoutStore(
    useShallow(((state) => ({
      isOpenNav: state.isOpenNav,
      setIsOpenNav: state.setIsOpenNav,
      isHideNav: state.isHideNav
    })))
  )

  return (
    <>
      {isHideNav ? (
        <button
          onClick={() => setIsOpenNav(!isOpenNav)}
          className={`absolute top-5 ${isOpenNav ? "translate-x-48 top-9 dark:hover:text-main" : "translate-x-62 dark:bg-hover dark:text-secondary dark:hover:text-main bg-light-hover p-[15px] text-white rounded-full"} transition-colors duration-300 cursor-pointer`}
        >
          <Menu />
        </button>
      ) : (
        <button
          onClick={() => setIsOpenNav(!isOpenNav)}
          className={`
            absolute ${isOpenNav ? "top-18 right-4" : "top-10 -right-4"}
            h-8 w-8
            flex items-center justify-center
            rounded-full dark:bg-hover dark:text-secondary dark:hover:text-main
            bg-light-hover text-white
            shadow-md
            hover:scale-105
            transition-colors duration-300
            cursor-pointer
          `}
        >
          {isOpenNav ? <ChevronLeft /> : <ChevronRight />}
        </button>
      )}
    </>
  );
}
