import { useThemeStore } from "@/stores/theme.store"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(s => s.theme)

  return (
    <div className={`bg-light-sidebar dark:bg-sidebar w-screen h-screen flex flex-col items-center pt-30 ${theme}`}>
      <div className="flex flex-col justify-center dark:text-main text-light-main p-10 rounded-xl gap-2 text-lg">
        {children}
      </div>
    </div>
  )
}