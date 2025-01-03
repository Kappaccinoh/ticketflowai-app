import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean | undefined;
}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        px-4 py-2 rounded-md font-medium transition-colors
        ${props.disabled 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-indigo-700 text-white hover:bg-indigo-800 active:bg-indigo-900'}
        ${props.className || ''}
      `}
      data-loading={props.loading ? 'true' : undefined}
    >
      {children}
    </button>
  )
}