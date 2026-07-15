import { forwardRef, type InputHTMLAttributes } from 'react'

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className = '', ...props },
  ref,
) {
  return <input ref={ref} className={`input ${className}`.trim()} {...props} />
})
