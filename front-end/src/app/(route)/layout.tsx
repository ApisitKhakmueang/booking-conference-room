"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import UserBar from "@/components/layout/user-bar";
import useMediaQuery from "@/hooks/ui/useMediaQuery";
import { useAuth } from "@/hooks/auth/useAuth";

import { SidebarLayoutProvider } from "@/context/SidebarLayoutContext";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuth()

  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarLayoutProvider value={{ isOpen, setIsOpen, isMobile }}>
      <div className="flex">
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
  )
}