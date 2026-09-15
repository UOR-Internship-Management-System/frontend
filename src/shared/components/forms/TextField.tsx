import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export type TextFieldVariant = 'outlined' | 'filled'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string
  variant?: TextFieldVariant
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  /** A real interactive element (e.g. a password-visibility toggle button), rendered in the
   *  trailing slot without being hidden from assistive tech, unlike the decorative `trailingIcon`. */
  trailingAction?: ReactNode
  error?: string
  supportingText?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    variant = 'outlined',
    leadingIcon,
    trailingIcon,
    trailingAction,
    error,
    supportingText,
    disabled = false,
    className = '',
    id,
    value,
    defaultValue,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? '')

  const currentVal = value !== undefined ? value : internalValue
  const isFloating = isFocused || Boolean(currentVal)
  const generatedId = useId()
  const inputId = id ?? (label ? `m3-tf-${generatedId}` : undefined)
  const hasError = Boolean(error)
  const supportingId = inputId && (hasError || supportingText) ? `${inputId}-supporting` : undefined
  const describedBy = [ariaDescribedBy, supportingId].filter(Boolean).join(' ') || undefined

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
    onChange?.(e)
  }

  return (
    <div className={`m3-text-field-container ${className}`.trim()}>
      <div
        className={`m3-text-field-box m3-text-field-box--${variant} ${
          isFloating ? 'm3-text-field-box--floating' : ''
        } ${hasError ? 'm3-text-field-box--error' : ''}`.trim()}
      >
        {leadingIcon ? (
          <span className="m3-text-field-leading-icon" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          placeholder={isFocused ? placeholder : undefined}
          className="m3-text-field-input"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          {...props}
        />

        {label ? (
          <label htmlFor={inputId} className="m3-text-field-label">
            {label}
          </label>
        ) : null}

        {trailingIcon ? (
          <span className="m3-text-field-trailing-icon" aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}

        {trailingAction ? (
          <span className="m3-text-field-trailing-action">{trailingAction}</span>
        ) : null}
      </div>

      {hasError || supportingText ? (
        <div className="m3-text-field-supporting-row" id={supportingId}>
          {hasError ? (
            <span className="m3-text-field-error-text" role="alert">
              {error}
            </span>
          ) : (
            <span>{supportingText}</span>
          )}
        </div>
      ) : null}
    </div>
  )
})
