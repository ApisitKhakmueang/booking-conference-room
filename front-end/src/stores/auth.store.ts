// stores/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState } from '../lib/interface/stores'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage', // ชื่อ localStorage key
    }
  )
)
