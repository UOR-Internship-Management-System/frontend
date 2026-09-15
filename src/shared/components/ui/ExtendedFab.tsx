import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { FabVariant } from './Fab'

export type ExtendedFabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: FabVariant
  icon?: ReactNode
  label: string
}

export function ExtendedFab({
  variant = 'primary',
  icon,
  label,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ExtendedFabProps) {
  const variantClass = `m3-fab--${variant}`

  return (
    <button
      type={type}
      className={`m3-extended-fab ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {icon ? (
        <span className="m3-extended-fab-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="m3-extended-fab-label">{label}</span>
    </button>
  )
}
