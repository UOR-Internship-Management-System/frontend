import type { ReactNode } from 'react'
import { Chip } from '../ui/Chip'

export type PageHeaderProps = {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ actions, description, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <Chip>Sprint 1 foundation shell</Chip>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  )
}
