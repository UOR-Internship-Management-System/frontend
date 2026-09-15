import { SelectHTMLAttributes, useEffect, useId, useRef, useState } from 'react'

export interface M3SelectFieldProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  label: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
}

export function M3SelectField({
  label,
  options,
  value,
  onChange,
  className = '',
  style,
  id,
  ...props
}: M3SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const selectId = id ?? `m3-select-${generatedId}`

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : ''
  const hasValue = Boolean(selectedOption)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`m3-dropdown-container ${isOpen ? 'is-open' : ''} ${hasValue ? 'has-value' : ''} ${className}`.trim()}
      style={style}
    >
      <div
        className="m3-dropdown-box m3-dropdown-box--outlined"
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-listbox`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        <label htmlFor={selectId} className="m3-dropdown-label">
          {label}
        </label>
        <div className="m3-dropdown-value">{displayValue}</div>
        <span className="material-symbols-outlined m3-dropdown-icon" aria-hidden="true">
          arrow_drop_down
        </span>
      </div>

      <div className="m3-dropdown-menu" role="listbox" id={`${selectId}-listbox`}>
        {options.length === 0 ? (
          <div
            className="m3-dropdown-item"
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          >
            No options available
          </div>
        ) : null}
        {options.map((option) => (
          <div
            key={option.value}
            className={`m3-dropdown-item ${value === option.value ? 'is-selected' : ''}`}
            role="option"
            aria-selected={value === option.value}
            onClick={(e) => {
              e.stopPropagation()
              onChange?.(option.value)
              setIsOpen(false)
            }}
          >
            {option.label}
          </div>
        ))}
      </div>

      {/* Native select for form integration and accessibility */}
      <select
        id={selectId}
        className="visually-hidden"
        value={value}
        aria-label={props['aria-label'] ?? label}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        <option value="" disabled />
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
