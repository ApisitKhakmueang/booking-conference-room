"use client";

import { useState } from "react";
import Sidebar from "@/src/components/sidebar/Sidebar";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div className="flex">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main
          className={`flex-1 transition-all duration-300 ${isOpen ? "ml-70" : "ml-16"}`}>
          {children}
        </main>
      </div>
    </>
  )
}