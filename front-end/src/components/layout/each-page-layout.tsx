'use client'

import { useSidebarLayout } from "@/context/SidebarLayoutContext";
import { EachPageLayoutProps } from "@/lib/interface/interface";

export default function EachPageLayout({
  pageName,
  children,
  className
}: EachPageLayoutProps) {
  const { isOpen, isSmallDisplay } = useSidebarLayout()

  return (
    <div className={`flex flex-col transition-[margin,padding] duration-300 
      ${!isSmallDisplay 
          ? isOpen 
            ? 'px-5' 
            : 'lg:px-30 px-5'
          : "lg:px-30 px-5"}`}>
      <h1 className="font-semibold text-4xl pb-5 dark:text-main">
        {pageName}
      </h1>

      <div className={className}>
        {children}
      </div>
    </div>
  )
}