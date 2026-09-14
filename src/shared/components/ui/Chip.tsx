import type { HTMLAttributes, ReactNode } from 'react'

export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion'

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant
  selected?: boolean
  leadingIcon?: ReactNode
  onRemove?: () => void
  interactive?: boolean
}

export function Chip({
  variant,
  selected = false,
  leadingIcon,
  onRemove,
  interactive,
  className = '',
  children,
  onClick,
  ...props
}: ChipProps) {
  const isInteractive = interactive ?? (Boolean(onClick) || variant === 'filter')
  const variantClass = variant ? `m3-chip--${variant}` : ''
  const selectedClass = selected ? 'm3-chip--selected' : ''
  const interactiveClass = isInteractive ? 'm3-chip--interactive' : ''

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={variant === 'filter' ? selected : undefined}
      className={`chip m3-chip ${variantClass} ${selectedClass} ${interactiveClass} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {selected && variant === 'filter' ? (
        <span className="material-symbols-outlined m3-chip-leading" aria-hidden="true">
          check
        </span>
      ) : leadingIcon ? (
        <span className="m3-chip-leading" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}

      {children}

      {onRemove ? (
        <button
          type="button"
          aria-label="Remove"
          className="m3-chip-remove-btn"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
            close
          </span>
        </button>
      ) : null}
    </span>
  )
}
