import { PageHeader } from '../../shared/components/layout/PageHeader'
import { SectionCard } from '../../shared/components/layout/SectionCard'

export type ShellPageProps = {
  title: string
  description: string
}

export function ShellPage({ description, title }: ShellPageProps) {
  return (
    <article>
      <PageHeader description={description} title={title} />
      <SectionCard aria-label={`${title} placeholder`}>
        <h2>Feature Placeholder</h2>
        <p>This area is designated for a future feature. Functionality is currently deferred.</p>
      </SectionCard>
    </article>
  )
}
