import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  leadingIcon?: ReactNode
  trailingAction?: ReactNode
  onClear?: () => void
  suggestions?: string[]
  onSelectSuggestion?: (suggestion: string) => void
}

export function SearchBar({
  value,
  defaultValue,
  placeholder = 'Search...',
  leadingIcon,
  trailingAction,
  onClear,
  suggestions = [],
  onSelectSuggestion,
  className = '',
  onChange,
  onFocus,
  onBlur,
  ...props
}: SearchBarProps) {
  const [internalVal, setInternalVal] = useState(defaultValue ?? value ?? '')
  const [isFocused, setIsFocused] = useState(false)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const currentVal = value !== undefined ? String(value) : String(internalVal)
  const showClear = Boolean(currentVal) && Boolean(onClear || onChange)
  const showSuggestions = isFocused && suggestions.length > 0

  const handleClear = () => {
    setInternalVal('')
    if (onClear) {
      onClear()
    } else if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalVal(e.target.value)
    onChange?.(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false)
    }, 200)
    onBlur?.(e)
  }

  return (
    <div
      className={`m3-search-bar-wrapper ${className}`.trim()}
      style={{ position: 'relative', width: '100%' }}
    >
      <div className="m3-search-bar" role="search">
        <span className="m3-search-icon" aria-hidden="true">
          {leadingIcon ?? (
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              search
            </span>
          )}
        </span>

        <input
          type="search"
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="m3-search-input"
          aria-label={props['aria-label'] ?? 'Search'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />

        <div className="m3-search-trailing">
          {showClear ? (
            <button
              type="button"
              aria-label="Clear search"
              className="m3-search-clear-btn"
              onClick={handleClear}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                close
              </span>
            </button>
          ) : null}

          {trailingAction}
        </div>
      </div>

      {showSuggestions ? (
        <div className="m3-search-view-panel" role="listbox" aria-label="Search suggestions">
          <ul className="m3-list" style={{ padding: 0 }}>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                role="option"
                aria-selected={false}
                className="m3-list-item m3-list-item--interactive"
                onMouseDown={() => {
                  setInternalVal(suggestion)
                  onSelectSuggestion?.(suggestion)
                }}
              >
                <span className="m3-list-item-leading" aria-hidden="true">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    history
                  </span>
                </span>
                <span className="m3-list-item-headline">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
