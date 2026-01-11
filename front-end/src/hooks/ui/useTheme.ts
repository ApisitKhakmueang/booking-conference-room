import { useThemeStore } from "@/stores/theme.store";

export default function useTheme() {
  const { theme, setTheme } = useThemeStore()
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}