"use client";

import { createContext, useContext } from "react";

type SidebarLayoutContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
};

const SidebarLayoutContext = createContext<SidebarLayoutContextType | null>(null);

export function SidebarLayoutProvider({
  value,
  children,
}: {
  value: SidebarLayoutContextType;
  children: React.ReactNode;
}) {
  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
}

export function useSidebarLayout() {
  const context = useContext(SidebarLayoutContext);
  if (!context) {
    throw new Error("useSidebarLayout must be used within SidebarLayoutProvider");
  }
  return context;
}
