import useTheme from "@/hooks/ui/useTheme";
import { cn } from "@/lib/utils";
import { useControlLayoutStore } from "@/stores/control-layout.store";
import {
  Moon,
  Sun
} from "lucide-react";

export default function ThemeButton({ className }: { className?: string}) {
  const isOpenNav = useControlLayoutStore((state) => state.isOpenNav)
  const { toggle } = useTheme();

  return (
    <button type="button" className={cn("p-5 cursor-pointer flex justify-center", className)} onClick={toggle}>
      <div className="dark:flex hidden dark:bg-sidebar dark:hover:bg-hover hover:text-main transition-duration-300 p-3 rounded-full shadow-xl">
        <Moon />
      </div>
      <div className="flex dark:hidden border border-slate-400 hover:bg-slate-100 text-black transition-duartion-300 p-3 rounded-full shadow-xl">
        <Sun />
      </div>
    </button>
  )
}