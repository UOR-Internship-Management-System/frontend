import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  isLoading?: boolean
  icon?: ReactNode
}

export function Button({
  children,
  className = '',
  disabled,
  icon,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={`button button-${variant} ${isLoading ? 'button-loading' : ''} ${className}`.trim()}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      <span className="button-content" aria-hidden={isLoading || undefined}>
        {icon}
        {children}
      </span>
      {isLoading ? (
        <>
          <span className="visually-hidden">Loading</span>
          <span aria-hidden="true" className="app-spinner button-spinner" />
        </>
      ) : null}
    </button>
  )
}
