// src/stores/auth.store.ts
import { create } from 'zustand'
import { AuthState } from '../lib/interface/interface'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
