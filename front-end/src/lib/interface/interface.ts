export interface LayoutPageProps {
  pageName: string;
  children: React.ReactNode;
  className?: string;
}

export interface OpenMobileProps {
  isOpen: boolean
  isMobile: boolean
}

// Group the same interface
export interface DropBgProps extends OpenMobileProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SidebarProps extends OpenMobileProps  {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface SidebarToggleProps extends OpenMobileProps {
  toggle: () => void;
};

export type UserBarProps = OpenMobileProps;

export interface UserIconProps {
  isMobile?: boolean;
  user: UserProfile | null
}

export interface WelcombackProps {
  isOpen?: boolean;
  user: UserProfile | null
}

export interface SidebarLayoutContextType {
  isOpen: boolean;
  isMobile: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  role: string
}

export interface AuthState {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
}

export interface UseProfileImageReturn {
  profileFile: File | null
  previewProfile: string
  error: string | null
  changeProfile: (e: React.ChangeEvent<HTMLInputElement>) => void
  setPreviewProfile: (url: string) => void
  cancelImage: () => void
}

export interface UseUsernameProps {
  username: string
  changeUsername: (username: string) => void
  cancelUsername: () => void
}