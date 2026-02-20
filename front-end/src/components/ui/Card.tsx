import { cn } from '@/utils/utils'
import { HTMLAttributes } from 'react'

type CardVariant = 'dark-purple' | 'purple'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

export default function Card({
  variant = 'dark-purple',
  loading = false,
  className,
  children
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-duration-300 font-medium',
        variantStyles[variant],
        (loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? 'Loading...' : children}
    </div>
  )
}

const variantStyles = {
  'dark-purple': 'bg-light-hover text-white dark:bg-card',
  purple: 'bg-light-sidebar text-violet-900 dark:text-white dark:bg-sidebar',
}
