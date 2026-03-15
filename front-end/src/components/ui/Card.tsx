import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils" // ปรับแก้เป็น "@/utils/utils" ได้ตามโปรเจกต์คุณ

// 🌟 1. ย้าย variantStyles มาใส่ใน cva เพื่อให้จัดการ Class ได้ง่ายตามแบบฉบับ Shadcn
const cardVariants = cva(
  // Base classes (รวมของ Shadcn และของคุณ)
  "group/card flex flex-col gap-4 overflow-hidden rounded-2xl py-4 text-sm transition-all duration-300 font-medium has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl",
  {
    variants: {
      variant: {
        // ของคุณ
        "dark-purple": "bg-light-hover text-white dark:bg-card",
        purple: "bg-light-sidebar text-violet-900 dark:text-white dark:bg-sidebar",
        // ของเดิมจาก Shadcn เผื่อต้องใช้
        default: "bg-card text-card-foreground",
      },
      size: {
        default: "",
        sm: "",
      },
    },
    defaultVariants: {
      variant: "dark-purple", // ตั้งค่า Default ให้ตรงกับของคุณ
      size: "default",
    },
  }
)

// 🌟 2. เพิ่ม Interface สำหรับรองรับ Variant และ Loading
export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  loading?: boolean
}

function Card({
  className,
  size,
  variant,
  loading = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        cardVariants({ variant, size, className }),
        loading && "opacity-50 cursor-not-allowed" // เพิ่ม Loading Style
      )}
      {...props}
    >
      {/* 🌟 3. จัดการ Loading State */}
      {loading ? (
        <div className="flex h-full w-full items-center justify-center p-4">
          Loading...
        </div>
      ) : (
        children
      )}
    </div>
  )
}

// ==========================================
// ส่วนนี้เป็นของ Shadcn เดิม ไม่ได้ปรับเปลี่ยน
// (แต่ปรับ rounded-t-xl เป็น 2xl ให้เข้ากับ Card หลัก)
// ==========================================

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-2xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-2xl p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}