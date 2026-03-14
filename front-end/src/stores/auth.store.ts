// stores/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState } from '../utils/interface/stores'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      sessionToken: null,
      setSessionToken: (token) => set({ sessionToken: token })
    }),
    {
      name: 'auth-storage', // ชื่อ localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        sessionToken: state.sessionToken 
      }),
    }
  )
)
