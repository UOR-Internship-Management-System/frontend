import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type FabVariant = 'surface' | 'primary' | 'secondary' | 'tertiary'
export type FabSize = 'small' | 'standard' | 'large'

export type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: FabVariant
  size?: FabSize
  icon: ReactNode
  'aria-label': string
  lowered?: boolean
}

export function Fab({
  variant = 'primary',
  size = 'standard',
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: FabProps) {
  const variantClass = `m3-fab--${variant}`
  const sizeClass = `m3-fab--size-${size}`

  return (
    <button
      type={type}
      className={`m3-fab ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      <span className="m3-fab-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}
