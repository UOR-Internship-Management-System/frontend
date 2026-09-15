import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  indeterminate?: boolean
  error?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked = false,
    indeterminate = false,
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
  const isChecked = checked && !indeterminate
  const generatedId = useId()
  const inputId = id ?? (label ? `m3-cb-${generatedId}` : undefined)

  return (
    <label
      htmlFor={inputId}
      className={`m3-checkbox-wrapper ${className}`.trim()}
      data-disabled={disabled || undefined}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-invalid={error || undefined}
        className="visually-hidden"
        onChange={onChange}
        {...props}
      />
      <span
        aria-hidden="true"
        className={`m3-checkbox ${
          isChecked ? 'm3-checkbox--checked' : ''
        } ${indeterminate ? 'm3-checkbox--indeterminate' : ''} ${
          error ? 'm3-checkbox--error' : ''
        }`.trim()}
      >
        {indeterminate ? (
          <span className="material-symbols-outlined m3-checkbox-icon">remove</span>
        ) : isChecked ? (
          <span className="material-symbols-outlined m3-checkbox-icon">check</span>
        ) : null}
      </span>
      {label ? <span className="m3-checkbox-label">{label}</span> : null}
    </label>
  )
})
