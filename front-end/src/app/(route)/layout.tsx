import NavigationLayout from "@/components/layout/navigation-layout";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationLayout>
      {children}  
    </NavigationLayout>
  )
}