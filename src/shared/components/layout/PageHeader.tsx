import type { ReactNode } from 'react'
import { Chip } from '../ui/Chip'

export type PageHeaderProps = {
  title: string
  description: string
  actions?: ReactNode
  eyebrow?: string
}

export function PageHeader({ actions, description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <Chip>{eyebrow}</Chip> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  )
}
