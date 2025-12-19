"use client";

import { useState } from "react";
import Sidebar from "@/src/components/Sidebar";
import UserBar from "@/src/components/UserBar";
import useMediaQuery from "@/src/hooks/ui/useMediaQuery";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div className="flex">
        <Sidebar 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          isMobile={isMobile}/>

        <UserBar />

        <main
          className={`flex-1 transition-all duration-300 ${!isMobile && (isOpen ? "ml-70" : "ml-23")}
        `}>
          {children}
        </main>
      </div>
    </>
  )
}