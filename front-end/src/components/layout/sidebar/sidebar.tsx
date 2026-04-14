"use client";

// Libraries
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cuboid,
  Calendar,
  List,
  History,
  User,
  SquareChartGantt
} from "lucide-react";

// Components
import SidebarToggle from "./sidebar-toggle";
import DropBackground from "./drop-background";
import { useShallow } from "zustand/shallow";
import { useControlLayoutStore } from "@/stores/control-layout.store";
import { useAuthStore } from "@/stores/auth.store";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Rooms", href: "/rooms", icon: Cuboid },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Schedule", href: "/schedule", icon: List },
  { name: "History", href: "/history", icon: History},
] as const;

const ADMIN_ITEMS = [
  { name: "Room Management", href: "/room-management", icon: SquareChartGantt },
  { name: "User Management", href: "/user-management", icon: User },
] as const;

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)

  const { isOpenNav, setIsOpenNav, isHideNav } = useControlLayoutStore(
    useShallow(((state) => ({
      isOpenNav: state.isOpenNav,
      setIsOpenNav: state.setIsOpenNav,
      isHideNav: state.isHideNav
    })))
  )
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`
          h-screen fixed dark:bg-sidebar
          bg-light-sidebar
          duration-300 z-90
          ${isHideNav
              ? isOpenNav
                ? "translate-x-0 w-64 transition-transform"
                : "-translate-x-full w-64 transition-transform"
              : isOpenNav
                ? "transition-[margin,padding,width] w-70"
                : "transition-[margin,padding,width] w-23"}
        `}
      >

        <nav className="p-5 relative flex flex-col justify-between h-full">
          <SidebarToggle />

          <ul className="space-y-2 font-semibold text-lg">
            {/* Logo */}
            <li className="flex justify-center mb-6">
              {/* {isOpenNav && (
              )} */}
              <Image
                src='/logo/logoEE-color.png'
                alt="logo"
                width={140}
                height={40}
              />
            </li>

            {SIDEBAR_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3
                      p-3 lg:p-4 rounded-full
                      transition-colors duration-300
                      ${isActive
                        ? "bg-light-hover text-white dark:bg-hover dark:text-main"
                        : "hover:bg-light-hover hover:text-white dark:hover:bg-hover dark:hover:text-main"}
                    `}
                    onClick={() => isHideNav && setIsOpenNav(false)}
                  >
                    
                    <Icon size={20} />
                    {isOpenNav && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}

            {user?.role === 'admin' && (
              <div className="border-t pt-2 space-y-2">
                {ADMIN_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3
                          p-3 lg:p-4 rounded-full
                          transition-colors duration-300 whitespace-nowrap
                          ${isActive
                            ? "bg-light-hover text-white dark:bg-hover dark:text-main"
                            : "hover:bg-light-hover hover:text-white dark:hover:bg-hover dark:hover:text-main"}
                        `}
                        onClick={() => isHideNav && setIsOpenNav(false)}
                      >
                        
                        <Icon size={20} />
                        {isOpenNav && <span>{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </div>
            )}
          </ul>
        </nav>
      </aside>

      <DropBackground />
    </>
  );
}
