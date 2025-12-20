'use client'

import { useSidebarLayout } from "@/src/context/SidebarLayoutContext";

type Props = {
  pageName: string;
  children: React.ReactNode;
}

export default function LayoutPage({
  pageName,
  children,
}: Props) {
  const { isOpen } = useSidebarLayout()

  return (
    <div className={`flex flex-col py-5 ${isOpen ? 'px-5' : 'px-30'}`}>
      <h1 className="font-semibold text-4xl">
        {pageName}
      </h1>

      <div>
        {children}
      </div>
    </div>
  )
}