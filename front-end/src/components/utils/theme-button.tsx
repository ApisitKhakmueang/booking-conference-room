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
      <div className="dark:flex hidden gap-2 bg-card hover:bg-hover hover:text-main transition-colors p-3 rounded-full shadow-xl">
        <Moon />
        {isOpen && 'Dark'}
      </div>
      <div className="flex dark:hidden gap-2 bg-light-card hover:bg-light-hover text-white transition-colors p-3 rounded-full shadow-xl">
        <Sun />
        {isOpen &&'Light'}
      </div>
    </button>
  )
}