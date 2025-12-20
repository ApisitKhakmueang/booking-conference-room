'use client'
import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

type CardVariant = 'dark-purple' | 'purple'

interface CardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
      className={clsx(
        'rounded-2xl transition font-medium',
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
  'dark-purple': 'bg-dark-purple text-white',
  purple: 'bg-light-purple text-violet-900',
}
