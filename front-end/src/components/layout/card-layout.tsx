export default function CardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bg-light-sidebar dark:bg-main-background w-screen h-screen flex flex-col items-center pt-30`}>
      <div className="flex flex-col justify-center dark:text-main text-light-main p-10 rounded-xl gap-2 text-lg">
        {children}
      </div>
    </div>
  )
}