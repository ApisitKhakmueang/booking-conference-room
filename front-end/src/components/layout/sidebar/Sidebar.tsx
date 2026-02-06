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
} from "lucide-react";
import { SidebarProps } from "@/lib/interface/interface";

// Components
import SidebarToggle from "./sidebar-toggle";
import BackgroundDrop from "./drop-background";
import ThemeButton from "../../utils/theme-button";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Rooms", href: "/rooms", icon: Cuboid },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Booking", href: "/booking", icon: List },
] as const;

export default function Sidebar({ isOpen, setIsOpen, isSmallDisplay }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`
          h-screen fixed dark:bg-sidebar
          bg-light-sidebar
          transition-[margin,padding,width] duration-300 z-20
          ${isSmallDisplay
              ? isOpen
                ? "translate-x-0 w-64"
                : "-translate-x-full w-64"
              : isOpen
                ? "w-70"
                : "w-23"}
        `}
      >

        <nav className="p-5 relative flex flex-col justify-between h-full">
          <SidebarToggle
            isOpen={isOpen}
            toggle={() => setIsOpen(v => !v)}
            isSmallDisplay={isSmallDisplay}
          />

          <ul className="space-y-2 font-semibold text-lg">
            {/* Logo */}
            <li className="flex justify-center mb-6">
              {/* {isOpen && (
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
                    onClick={() => isSmallDisplay && setIsOpen(false)}
                  >
                    
                    <Icon size={20} />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ThemeButton isOpen={isOpen} />
        </nav>
      </aside>

      <BackgroundDrop isOpen={isOpen} isSmallDisplay={isSmallDisplay} setIsOpen={setIsOpen} />
    </>
  );
}
