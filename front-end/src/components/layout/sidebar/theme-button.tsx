import {
  Moon,
  Sun
} from "lucide-react";

interface ThemeButtonProps {
  theme: 'light' | 'dark'
  toggle: () => void
}

export default function ThemeButton({ theme, toggle }: ThemeButtonProps) {
  return (
    <button type="button" className="p-5 cursor-pointer flex justify-center" onClick={toggle}>
      {theme === 'dark' ? (
        <div className="flex gap-2 bg-card hover:bg-hover hover:text-main transition-colors p-3 rounded-full shadow-xl">
          <Moon />
          Dark
        </div>
      ) : (
        <div className="flex gap-2 bg-light-card hover:bg-light-hover text-white transition-colors p-3 rounded-full shadow-xl">
          <Sun />
          Light
        </div>
      )}
    </button>
  )
}