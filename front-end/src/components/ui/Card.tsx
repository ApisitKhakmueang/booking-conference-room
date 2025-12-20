'use client'
import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

type CardVariant = 'green' | 'white' 

interface CardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CardVariant
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

export default function Card({
  variant = 'green',
  loading = false,
  className,
  children
}: CardProps) {
  return (
    <button
      className={clsx(
        'rounded-full transition font-medium cursor-pointer',
        variantStyles[variant],
        (loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

const variantStyles = {
  green: 'bg-green-400 text-white border border-slate-200',
  white: 'bg-white text-black border border-slate-200',
}
