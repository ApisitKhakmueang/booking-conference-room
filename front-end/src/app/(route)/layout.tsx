import LayoutNavigation from "@/components/layout/layout-navigation";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutNavigation>
      {children}  
    </LayoutNavigation>
  )
}