import { ControlLayoutState } from '@/utils/interface/stores'
import { create } from 'zustand'

export const useControlLayoutStore = create<ControlLayoutState>()(
  (set) => ({
    isHideNav: false,
    isOpenNav: true,
    setIsHideNav: (isHide) => set({ isHideNav: isHide }),
    setIsOpenNav: (isOpen) => set({ isOpenNav: isOpen }),
  })
)