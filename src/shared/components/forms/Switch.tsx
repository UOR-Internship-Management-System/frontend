import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  thumbIcon?: ReactNode
  checkedThumbIcon?: ReactNode
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked = false,
    label,
    disabled = false,
    thumbIcon,
    checkedThumbIcon,
    className = '',
    id,
    onChange,
    ...props
  },
  ref,
) {
  const inputId = id ?? (label ? `m3-switch-${Math.random().toString(36).substring(2, 9)}` : undefined)
  const activeIcon = checked && checkedThumbIcon ? checkedThumbIcon : thumbIcon

  return (
    <label
      htmlFor={inputId}
      className={`m3-switch-wrapper ${className}`.trim()}
      data-disabled={disabled || undefined}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        className="visually-hidden"
        onChange={onChange}
        {...props}
      />
      <span
        aria-hidden="true"
        className={`m3-switch-track ${checked ? 'm3-switch-track--checked' : ''}`.trim()}
      >
        <span className="m3-switch-thumb">
          {activeIcon ? (
            <span style={{ fontSize: 14, lineHeight: 1 }} aria-hidden="true">
              {activeIcon}
            </span>
          ) : checked ? (
            <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
              check
            </span>
          ) : null}
        </span>
      </span>
      {label ? <span className="m3-switch-label">{label}</span> : null}
    </label>
  )
})
