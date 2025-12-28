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
import { SidebarProps } from "@/src/lib/interface/interface";

// Components
import SidebarToggle from "./SidebarToggle";
import BackgroundDrop from "./DropBackground";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Rooms", href: "/rooms", icon: Cuboid },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Booking", href: "/booking", icon: List },
] as const;

export default function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`
          h-screen fixed
          bg-light-purple
          transition-duration-300 z-20
          ${isMobile
              ? isOpen
                ? "translate-x-0 w-64"
                : "-translate-x-full w-64"
              : isOpen
                ? "w-70"
                : "w-23"}
        `}
      >

        <nav className="p-5 relative">
          <SidebarToggle
            isOpen={isOpen}
            toggle={() => setIsOpen(v => !v)}
            isMobile={isMobile}
          />

          <ul className="space-y-2 font-semibold text-lg">
            {/* Logo */}
            <li className="flex justify-center mb-6">
              {/* {isOpen && (
              )} */}
              <Image
                src="/logo/Infineon-Logo.svg"
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
                      transition-colors
                      ${isActive
                        ? "bg-dark-purple text-white"
                        : "hover:bg-dark-purple hover:text-white"}
                    `}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    
                    <Icon size={20} />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <BackgroundDrop isOpen={isOpen} isMobile={isMobile} setIsOpen={setIsOpen} />
    </>
  );
}
