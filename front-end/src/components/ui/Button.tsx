'use client'
import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dark-purple' | 'slate'
type ButtonSize = 'sm' | 'md' | 'lg' | 'circle'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'rounded-full transition font-medium cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-black hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  'dark-purple' : 'bg-dark-purple text-white hover:bg-violet-500',
  slate: 'bg-slate-50 text-black hover:bg-slate-200 border-1 border-slate-400',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
  circle: 'p-3'
}
