import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export type RadioButtonProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  error?: boolean
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  {
    checked = false,
    label,
    disabled = false,
    error = false,
    className = '',
    id,
    onChange,
    ...props
  },
  ref,
) {
  const inputId = id ?? (label ? `m3-radio-${Math.random().toString(36).substring(2, 9)}` : undefined)

  return (
    <label
      htmlFor={inputId}
      className={`m3-radio-wrapper ${className}`.trim()}
      data-disabled={disabled || undefined}
    >
      <input
        ref={ref}
        id={inputId}
        type="radio"
        checked={checked}
        disabled={disabled}
        className="visually-hidden"
        onChange={onChange}
        {...props}
      />
      <span
        aria-hidden="true"
        className={`m3-radio ${checked ? 'm3-radio--selected' : ''} ${
          error ? 'm3-radio--error' : ''
        }`.trim()}
      >
        {checked ? <span className="m3-radio-dot" /> : null}
      </span>
      {label ? <span className="m3-radio-label">{label}</span> : null}
    </label>
  )
})
