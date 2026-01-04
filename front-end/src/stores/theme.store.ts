import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeState } from '../lib/interface/interface'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggle: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })
      ),
    }),
    {
      name: 'theme-storage', // 👈 localStorage key
    }
  )
)