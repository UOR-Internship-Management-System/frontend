import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  supportingText?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className = '',
    error,
    id,
    label,
    supportingText,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? `m3-ta-${generatedId}`
  const supportingId = error || supportingText ? `${inputId}-supporting` : undefined
  const describedBy = [ariaDescribedBy, supportingId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`m3-text-area-container ${className}`.trim()}>
      {label ? (
        <label className="m3-text-area-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <textarea
        {...props}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error) || undefined}
        className="input m3-text-area-input"
        id={inputId}
        ref={ref}
      />
      {error || supportingText ? (
        <div className="m3-text-field-supporting-row" id={supportingId}>
          {error ? (
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
