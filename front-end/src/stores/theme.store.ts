import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeState } from '../lib/interface/stores'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggle: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })
      ),
      setTheme: (theme) => {
        document.cookie = `theme=${theme}; path=/; max-age=31536000`
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        set({ theme })
      }
    }),
    {
      name: 'theme-storage', // 👈 localStorage key
    }
  )
)