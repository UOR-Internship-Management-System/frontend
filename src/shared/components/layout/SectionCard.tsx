import type { HTMLAttributes } from 'react'

export function SectionCard({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`section-card ${className}`.trim()} {...props} />
}
