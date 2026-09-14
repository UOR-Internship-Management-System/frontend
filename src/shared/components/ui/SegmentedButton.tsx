import type { ReactNode } from 'react'

export type SegmentOption<T extends string = string> = {
  value: T
  label: string
  icon?: ReactNode
  disabled?: boolean
  badge?: string | number
}

export type SegmentedButtonProps<T extends string = string> = {
  options: SegmentOption<T>[]
  value: T | T[]
  onChange: (value: T) => void
  multiSelect?: boolean
  className?: string
  ariaLabel?: string
}

export function SegmentedButton<T extends string = string>({
  options,
  value,
  onChange,
  multiSelect = false,
  className = '',
  ariaLabel = 'Options',
}: SegmentedButtonProps<T>) {
  const isSelected = (optVal: T) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(optVal)
    }
    return value === optVal
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`m3-segmented-button-container ${className}`.trim()}
    >
      {options.map((option) => {
        const selected = isSelected(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            disabled={option.disabled}
            className={`m3-segmented-button-item ${
              selected ? 'm3-segmented-button-item--selected' : ''
            }`.trim()}
            onClick={() => onChange(option.value)}
          >
            {selected ? (
              <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
                check
              </span>
            ) : option.icon ? (
              <span className="m3-segmented-button-icon" aria-hidden="true">
                {option.icon}
              </span>
            ) : null}
            <span>{option.label}</span>
            {option.badge !== undefined ? (
              <span className="m3-segmented-button-badge">{option.badge}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
