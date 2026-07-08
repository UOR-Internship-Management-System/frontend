import type { HTMLAttributes } from 'react'

export function Dropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`section-card ${className}`.trim()} {...props} />
}
