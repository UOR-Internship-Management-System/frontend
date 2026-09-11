import { forwardRef, useId, useState } from 'react'
import { TextInput, type TextInputProps } from './TextInput'

export const PasswordInput = forwardRef<HTMLInputElement, TextInputProps>(function PasswordInput(
  { id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="password-input-wrap">
      <TextInput {...props} id={inputId} ref={ref} type={visible ? 'text' : 'password'} />
      <button
        aria-controls={inputId}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="password-toggle-button"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          {visible ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  )
})
