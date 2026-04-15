import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // คลาสจากโค้ดด้านบนที่นำมาใส่
        "border border-gray-300 rounded-md dark:border-secondary",
        // คลาสเดิมของด้านล่าง (ที่เอาตัวซ้ำซ้อนออกแล้ว)
        "h-8 w-full min-w-0 bg-transparent text-base transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40  focus:border-dark-purple focus:ring-1 focus:ring-dark-purple outline-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }