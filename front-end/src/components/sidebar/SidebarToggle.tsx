// components/sidebar/SidebarToggle.tsx
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

type Props = {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
};

export default function SidebarToggle({ isOpen, toggle, isMobile }: Props) {
  return (
    <>
      {isMobile ? (
        <button
          onClick={toggle}
          className={`absolute top-4 ${isOpen ? "translate-x-50" : "translate-x-62 bg-dark-purple p-2 text-white rounded-full"} transition-all duration-300 cursor-pointer`}
        >
          <Menu />
        </button>
      ) : (
        <button
          onClick={toggle}
          className="
            absolute top-4 -right-12
            h-10 w-10
            flex items-center justify-center
            rounded-full
            bg-dark-purple text-white
            shadow-md
            hover:scale-105
            transition
            cursor-pointer
          "
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      )}
    </>
  );
}
