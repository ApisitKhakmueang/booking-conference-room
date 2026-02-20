'use client'

import { EachPageLayoutProps } from "@/utils/interface/interface";
import { useControlLayoutStore } from "@/stores/control-layout.store";
import { useShallow } from "zustand/shallow";

export default function EachPageLayout({
  pageName,
  children,
  className
}: EachPageLayoutProps) {
  const { isOpenNav, isHideNav } = useControlLayoutStore(
    useShallow((state) => ({
      isOpenNav: state.isOpenNav,
      isHideNav: state.isHideNav
    }))
  )

  return (
    <div className={`flex flex-col transition-[margin,padding] duration-300 
      ${!isHideNav 
          ? isOpenNav 
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