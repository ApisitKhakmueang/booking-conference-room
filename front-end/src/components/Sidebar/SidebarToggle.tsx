// components/sidebar/SidebarToggle.tsx
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { SidebarToggleProps } from "@/src/lib/interface/interface";

export default function SidebarToggle({ isOpen, toggle, isMobile }: SidebarToggleProps) {
  return (
    <>
      {isMobile ? (
        <button
          onClick={toggle}
          className={`absolute top-5 ${isOpen ? "translate-x-48 top-9" : "translate-x-62 bg-dark-purple p-[15px] text-white rounded-full"} transition-duration-300 cursor-pointer`}
        >
          <Menu />
        </button>
      ) : (
        <button
          onClick={toggle}
          className={`
            absolute ${isOpen ? "top-18 right-4" : "top-10 -right-4"}
            h-8 w-8
            flex items-center justify-center
            rounded-full
            bg-dark-purple text-white
            shadow-md
            hover:scale-105
            transition
            cursor-pointer
          `}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      )}
    </>
  );
}
