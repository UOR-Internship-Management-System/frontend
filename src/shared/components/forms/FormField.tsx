import type { ReactNode } from 'react'
import { FormErrorMessage } from './FormErrorMessage'

export type FormFieldProps = {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ children, error, htmlFor, label }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      <FormErrorMessage message={error} />
    </div>
  )
}
