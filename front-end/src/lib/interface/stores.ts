import { UserProfile } from "./interface"

export interface AuthState {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
}

type Theme = 'dark' | 'light'

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export interface ControlLayoutState {
  isHideNav: boolean
  isOpenNav: boolean
  setIsHideNav: (isHide: boolean) => void
  setIsOpenNav: (isOpen: boolean) => void
}