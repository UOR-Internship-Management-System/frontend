import type { SelectHTMLAttributes } from 'react'

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement>

export function SelectField({ className = '', ...props }: SelectFieldProps) {
  return <select className={`select ${className}`.trim()} {...props} />
}
