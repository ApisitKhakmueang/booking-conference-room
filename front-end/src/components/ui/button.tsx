import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui" // หรือนำเข้าจาก "@radix-ui/react-slot" ตามที่คุณมี

import { cn } from "@/lib/utils" // แก้ path เป็น "@/utils/utils" ได้ถ้าโปรเจกต์คุณใช้แบบนั้น

const buttonVariants = cva(
  // 🌟 1. ปรับ Base Classes: เพิ่ม rounded-full, duration-300, cursor-pointer ตามโค้ดเดิมของคุณ
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        // --- ของเดิมจาก Shadcn (เก็บไว้เผื่อได้ใช้) ---
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        
        // 🌟 2. เพิ่ม Custom Variants ของคุณ
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-black hover:bg-gray-300", // (ทับของเดิม Shadcn)
        danger: "bg-red-500 text-white hover:bg-red-600",
        "dark-purple": "bg-light-card text-white hover:bg-light-hover",
        slate: "bg-slate-50 text-black hover:bg-slate-300",
        blue: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer duration-150",
        transparent: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-hover cursor-pointer duration-150",
        dropdown: "flex items-center justify-between gap-2 min-w-35px-3 text-sm rounded cursor-pointeborder border-white dark:border-hover"
      },
      size: {
        // 🌟 3. เพิ่ม Custom Sizes ของคุณ
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
        
        // --- ของเดิมจาก Shadcn (เก็บไว้สำหรับ icon) ---
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      // 🌟 4. ตั้งค่า Default ใหม่ให้ตรงกับที่คุณออกแบบไว้
      variant: "primary",
      size: "md",
    },
  }
)

// 🌟 5. เพิ่ม Interface เพื่อรองรับ loading state
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
  loading = false, // 🌟 รับค่า loading
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
      disabled={disabled || loading} // 🌟 ถ้าโหลดอยู่ ให้ disable ปุ่ม
      {...props}
    >
      {/* 🌟 ถ้า loading เป็น true ให้โชว์คำว่า Loading... แทน children */}
      {loading ? "Loading..." : children}
    </Comp>
  )
}

export { Button, buttonVariants }