import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
  'primary' | 'secondary' | 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'danger'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: ReactNode
  trailingIcon?: ReactNode
}

export function Button({
  children,
  className = '',
  disabled,
  icon,
  trailingIcon,
  isLoading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  // Map legacy & M3 variants to unified classes
  const m3Variant = variant === 'primary' ? 'filled' : variant === 'secondary' ? 'tonal' : variant

  const legacyClass = `button-${variant}`
  const m3Class = `m3-button--${m3Variant}`
  const sizeClass = `m3-button--size-${size}`
  const loadingClass = isLoading ? 'button-loading' : ''

  return (
    <button
      aria-busy={isLoading || undefined}
      className={`button m3-button ${legacyClass} ${m3Class} ${sizeClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      <span className="button-content" aria-hidden={isLoading || undefined}>
        {icon ? (
          <span className="button-icon-leading" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
        {trailingIcon ? (
          <span className="button-icon-trailing" aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
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
