"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cuboid,
  Calendar,
  List,
  House
} from "lucide-react";
import SidebarToggle from "./SidebarToggle";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Rooms", href: "/rooms", icon: Cuboid },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Booking", href: "/booking", icon: List },
];

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isOpen, setIsOpen }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        h-screen fixed
        bg-light-purple
        transition-all duration-300
        ${isOpen ? "w-70" : "w-23"}
      `}
    >
      <SidebarToggle
        isOpen={isOpen}
        toggle={() => setIsOpen(v => !v)}
      />

      <nav className="p-5 relative">
        <ul className="space-y-2 font-semibold">
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
                    p-4 rounded-full
                    transition-colors
                    ${isActive
                      ? "bg-dark-purple text-white"
                      : "hover:bg-dark-purple hover:text-white"}
                  `}
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
  );
}
