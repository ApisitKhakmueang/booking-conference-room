import { UserProfile } from "./interface"
import { RoomResp } from "./response"

export interface AuthState {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  sessionToken: string | null;
  setSessionToken: (sessionToken: string | null) => void
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

export interface RoomState {
  rooms: RoomResp[] | null
  setRooms: (newRooms: RoomResp[]) => void
}