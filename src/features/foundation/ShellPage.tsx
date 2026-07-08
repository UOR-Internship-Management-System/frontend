import { PageHeader } from '../../shared/components/layout/PageHeader'
import { SectionCard } from '../../shared/components/layout/SectionCard'
import { SkeletonBlock } from '../../shared/components/feedback/SkeletonBlock'

export type ShellPageProps = {
  title: string
  description: string
}

export function ShellPage({ description, title }: ShellPageProps) {
  return (
    <article>
      <PageHeader description={description} title={title} />
      <SectionCard aria-label={`${title} placeholder`}>
        <h2>Foundation placeholder</h2>
        <p>
          This route is intentionally limited to a Sprint 1 shell. Feature behavior is deferred.
        </p>
        <SkeletonBlock />
      </SectionCard>
    </article>
  )
}
