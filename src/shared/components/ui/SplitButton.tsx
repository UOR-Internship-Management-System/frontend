import type { ReactNode } from 'react'
import { Button, type ButtonSize, type ButtonVariant } from './Button'

export type SplitButtonProps = {
  children: ReactNode
  onClick?: () => void
  onToggleMenu?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  isLoading?: boolean
  icon?: ReactNode
  menuAriaLabel?: string
  className?: string
}

export function SplitButton({
  children,
  onClick,
  onToggleMenu,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon,
  menuAriaLabel = 'More options',
  className = '',
}: SplitButtonProps) {
  return (
    <div className={`m3-split-button-container ${className}`.trim()}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        isLoading={isLoading}
        icon={icon}
        onClick={onClick}
        className="m3-split-button-primary"
      >
        {children}
      </Button>
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        aria-label={menuAriaLabel}
        onClick={onToggleMenu}
        className="m3-split-button-toggle"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">
          arrow_drop_down
        </span>
      </Button>
    </div>
  )
}
