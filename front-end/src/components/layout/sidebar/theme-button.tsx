import {
  Moon,
  Sun
} from "lucide-react";

interface ThemeButtonProps {
  isOpen: boolean
  theme: 'light' | 'dark'
  toggle: () => void
}

export default function ThemeButton({ theme, toggle, isOpen }: ThemeButtonProps) {
  return (
    <button type="button" className="p-5 cursor-pointer flex justify-center" onClick={toggle}>
      {theme === 'dark' ? (
        <div className="flex gap-2 bg-card hover:bg-hover hover:text-main transition-colors p-3 rounded-full shadow-xl">
          <Moon />
          {isOpen && 'Dark'}
        </div>
      ) : (
        <div className="flex gap-2 bg-light-card hover:bg-light-hover text-white transition-colors p-3 rounded-full shadow-xl">
          <Sun />
          {isOpen &&'Light'}
        </div>
      )}
    </button>
  )
}