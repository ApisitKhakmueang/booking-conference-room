import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui" 

import { cn } from "@/lib/utils" 

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-black hover:bg-gray-300", 
        danger: "bg-red-500 text-white hover:bg-red-600",
        
        // 🌟 อัปเดต variant นี้โดยเอา className เดิมของคุณมาใส่ (เพิ่ม rounded เพื่อทับ rounded-full ของ base)
        "dark-purple": "bg-dark-purple hover:bg-dark-purple/90 dark:bg-dark-purple/80 dark:hover:bg-dark-purple text-white shadow-md rounded",
        
        purple: "bg-light-sidebar hover:bg-dark-purple/50 border dark:bg-sidebar dark:hover:bg-hover border dark:border-hover", 
        slate: "bg-slate-50 text-black hover:bg-slate-300",
        blue: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer duration-150",
        transparent: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-hover cursor-pointer duration-150",
        dropdown: "flex items-center justify-between gap-2 min-w-35 px-3 text-sm rounded cursor-pointe border border-white dark:border-hover",
        "outline-purple": "bg-transparent border border-gray-200 text-light-secondary hover:bg-light-purple hover:text-dark-purple dark:border-hover dark:text-white dark:hover:bg-hover dark:hover:text-white rounded",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2", // 🌟 ตรงกับ px-4 py-2 ของคุณ
        lg: "px-6 py-3 text-lg",
        
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false, 
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading} 
      {...props}
    >
      {loading ? "Loading..." : children}
    </Comp>
  )
}

export { Button, buttonVariants }