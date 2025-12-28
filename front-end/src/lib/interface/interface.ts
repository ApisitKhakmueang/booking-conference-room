export type LayoutPageProps = {
  pageName: string;
  children: React.ReactNode;
  className?: string;
}

export type OpenMobileProps = {
  isOpen: boolean
  isMobile: boolean
}

// Group the same interface
export type DropBgProps = OpenMobileProps & {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export type SidebarProps = OpenMobileProps & {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type SidebarToggleProps = OpenMobileProps & {
  toggle: () => void;
};

export type UserBarProps = OpenMobileProps;

export type UserIconProps = {
  isMobile?: boolean;
  user: UserProfile | null
}

export type WelcombackProps = {
  isOpen?: boolean;
  user: UserProfile | null
}

export type SidebarLayoutContextType = {
  isOpen: boolean;
  isMobile: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type UserProfile = {
  id: string
  email: string
  name?: string
  avatar?: string
  role: string
}

export type AuthState = {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
}