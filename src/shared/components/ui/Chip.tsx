import type { HTMLAttributes } from 'react'

export function Chip({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`chip ${className}`.trim()} {...props} />
}
