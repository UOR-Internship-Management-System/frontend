import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant
  size?: IconButtonSize
  icon: ReactNode
  selected?: boolean
  selectedIcon?: ReactNode
  'aria-label': string
}

export function IconButton({
  variant = 'standard',
  size = 'md',
  icon,
  selected = false,
  selectedIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: IconButtonProps) {
  const currentIcon = selected && selectedIcon ? selectedIcon : icon

  return (
    <button
      type={type}
      className={`m3-icon-button m3-icon-button--${variant} m3-icon-button--size-${size} ${
        selected ? 'm3-icon-button--selected' : ''
      } ${className}`.trim()}
      disabled={disabled}
      aria-pressed={props['aria-pressed'] ?? (selected ? 'true' : undefined)}
      {...props}
    >
      <span className="m3-icon-button-content" aria-hidden="true">
        {currentIcon}
      </span>
    </button>
  )
}
