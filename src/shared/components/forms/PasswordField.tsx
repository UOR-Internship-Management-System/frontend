import { forwardRef, useId, useState } from 'react'
import { TextField, type TextFieldProps } from './TextField'

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailingAction' | 'trailingIcon'>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ id, ...props }, ref) {
    const [visible, setVisible] = useState(false)
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <TextField
        {...props}
        id={inputId}
        ref={ref}
        trailingAction={
          <button
            aria-controls={inputId}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              {visible ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
        type={visible ? 'text' : 'password'}
      />
    )
  },
)
