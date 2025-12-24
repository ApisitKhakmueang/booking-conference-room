"use client";

import { useState } from "react";
import Sidebar from "@/src/components/Sidebar";
import UserBar from "@/src/components/UserBar";
import useMediaQuery from "@/src/hooks/ui/useMediaQuery";

import { SidebarLayoutProvider } from "@/src/context/SidebarLayoutContext";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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