import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 🌟 1. Layout, Padding, & Font size
        "w-full min-w-0 px-3 py-2 text-base md:text-sm",
        
        // 🌟 2. Border, Radius, & Shadow
        "border border-gray-200 dark:border-sidebar rounded-lg shadow-sm",
        
        // 🌟 3. Background & Text Colors
        "bg-transparent dark:bg-sidebar text-gray-800 dark:text-white",
        
        // 🌟 4. Placeholder
        "placeholder:text-gray-400 dark:placeholder:text-gray-600",
        
        // 🌟 5. Focus & Transitions (สีม่วงที่คุณต้องการ)
        "transition-all outline-none focus:border-dark-purple focus:ring-1 focus:ring-dark-purple focus-visible:border-dark-purple focus-visible:ring-1 focus-visible:ring-dark-purple",
        
        // 🌟 6. File & Disabled & Invalid states (เก็บไว้ให้รองรับการใช้งานอื่นๆ)
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-sidebar/80 disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500/20",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }