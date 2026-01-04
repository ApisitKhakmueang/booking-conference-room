"use client";

// Library
import { useState } from "react";

// Hook
import useMediaQuery from "@/hooks/ui/useMediaQuery";
import { useAuth } from "@/hooks/auth/useAuth";

// Component
import UserBar from "./user-bar";
import Sidebar from "./sidebar";

// Store
import { SidebarLayoutProvider } from "@/context/SidebarLayoutContext";

export default function LayoutNavigation({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuth()
  
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="dark">
      <SidebarLayoutProvider value={{ isOpen, setIsOpen, isMobile }}>
        <div className="flex dark:bg-main-background bg-white dark:text-secondary text-black">
          <Sidebar 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            isMobile={isMobile}/>

          <UserBar 
            isOpen={isOpen} 
            isMobile={isMobile}/>

          <main
            className={`flex-1 transition-duration-300 mt-25 ${!isMobile && (isOpen ? "ml-70" : "ml-23")}
          `}>
            {children}
          </main>
        </div>
      </SidebarLayoutProvider>
    </div>
  )
}