import useTheme from "@/hooks/ui/useTheme";
import { cn } from "@/lib/utils";
import {
  Moon,
  Sun
} from "lucide-react";

interface ThemeButtonProps {
  isOpen: boolean
  className?: string
}

export default function ThemeButton({ isOpen, className }: ThemeButtonProps) {
  const { toggle } = useTheme();

  return (
    <button type="button" className={cn("p-5 cursor-pointer flex justify-center", className)} onClick={toggle}>
      <div className="dark:flex hidden bg-card hover:bg-hover hover:text-main transition-colors p-3 rounded-full shadow-xl">
        <Moon />
        <span
          className={`
            overflow-hidden whitespace-nowrap transition-duration-300 ease-in-out
            ${isOpen ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
          `}
        >
          Dark
        </span>
      </div>
      <div className="flex dark:hidden bg-light-card hover:bg-light-hover text-white transition-colors p-3 rounded-full shadow-xl">
        <Sun />
        <span
          className={`
            overflow-hidden whitespace-nowrap transition-duration-300 ease-in-out
            ${isOpen ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
          `}
        >
          Light
        </span>
      </div>
    </button>
  )
}