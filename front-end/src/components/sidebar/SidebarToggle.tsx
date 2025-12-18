// components/sidebar/SidebarToggle.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  isOpen: boolean;
  toggle: () => void;
};

export default function SidebarToggle({ isOpen, toggle }: Props) {
  return (
    <button
      onClick={toggle}
      className="
        absolute inset-y-1/2 -right-3
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
  );
}
