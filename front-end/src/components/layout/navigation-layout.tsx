"use client";

// Library
import { useState } from "react";

// Hook
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import useAuth from "@/hooks/auth/useAuth";

// Component
import UserBar from "./user-bar";
import Sidebar from "./sidebar";

// Context
import { SidebarLayoutProvider } from "@/context/SidebarLayoutContext";

export default function NavigationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isSmallDisplay = useMediaQuery("(max-width: 1024px)");
  const [isOpen, setIsOpen] = useState(true);
  
  useAuth()
  
  return (
    <div>
      <SidebarLayoutProvider value={{ isOpen, setIsOpen, isSmallDisplay }}>
        <div className="flex dark:bg-main-background bg-light-main-background dark:text-secondary text-black">
          <Sidebar 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            isSmallDisplay={isSmallDisplay}/>

          <UserBar 
            isOpen={isOpen} 
            isSmallDisplay={isSmallDisplay}/>

          <main
            className={`flex-1 transition-[margin,padding] duration-300 mt-25 ${!isSmallDisplay && (isOpen ? "ml-70" : "ml-23")}
          `}>
            {children}
          </main>
        </div>
      </SidebarLayoutProvider>
    </div>
  )
}