'use client'

import { useSidebarLayout } from "@/src/context/SidebarLayoutContext";

type Props = {
  pageName: string;
  children: React.ReactNode;
  className?: string;
}

export default function LayoutPage({
  pageName,
  children,
  className
}: Props) {
  const { isOpen } = useSidebarLayout()

  return (
    <div className={`flex flex-col py-5 ${isOpen ? 'px-5' : 'md:px-30 px-10'}`}>
      <h1 className="font-semibold text-4xl pb-5">
        {pageName}
      </h1>

      <div className={className}>
        {children}
      </div>
    </div>
  )
}