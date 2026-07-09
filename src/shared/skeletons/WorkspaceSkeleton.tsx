import type { CSSProperties } from 'react'
import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

export type WorkspaceSkeletonVariant = 'cv-builder' | 'skills'

function Shape({ height = 14, rounded = false, width = '100%' }: { height?: CSSProperties['height']; rounded?: boolean; width?: CSSProperties['width'] }) {
  return <SkeletonBlock decorative height={height} lines={0} rounded={rounded} variant="inline" width={width} />
}

function PageHeaderSkeleton() {
  return (
    <header className="page-header skeleton-page-header" aria-hidden="true">
      <div>
        <Shape height={24} rounded width={150} />
        <Shape height={44} width="min(420px, 82vw)" />
        <SkeletonBlock decorative lineWidths={['min(620px, 90vw)', 'min(460px, 72vw)']} lines={2} variant="inline" />
      </div>
      <Shape height={42} rounded width={150} />
    </header>
  )
}

function CvBuilderWorkspaceSkeleton() {
  return (
    <div className="cv-workspace-skeleton" aria-hidden="true">
      <section className="section-card cv-preview-skeleton">
        <Shape height={28} width={220} />
        <div className="cv-paper-skeleton">
          <Shape height={30} width="62%" />
          <SkeletonBlock decorative lineWidths={['82%', '92%', '76%', '88%', '66%']} lines={5} variant="inline" />
          <Shape height={1} />
          <SkeletonBlock decorative lineWidths={['72%', '84%', '58%', '76%', '64%', '52%']} lines={6} variant="inline" />
        </div>
      </section>
      <section className="section-card cv-source-skeleton">
        <Shape height={28} width={240} />
        <SkeletonBlock decorative lineWidths={['90%', '72%', '80%']} lines={3} variant="inline" />
        <Shape height={44} rounded width={180} />
        <Shape height={44} rounded width={180} />
      </section>
    </div>
  )
}

function SkillsWorkspaceSkeleton() {
  return (
    <div className="skills-workspace-skeleton" aria-hidden="true">
      <section className="section-card skills-browser-skeleton">
        <Shape height={28} width={230} />
        <Shape height={42} rounded />
        {Array.from({ length: 5 }, (_, index) => (
          <div className="skill-category-skeleton" key={index}>
            <Shape height={18} width="56%" />
            <div className="skill-chip-skeleton-row">
              <Shape height={32} rounded width={96} />
              <Shape height={32} rounded width={118} />
              <Shape height={32} rounded width={84} />
            </div>
          </div>
        ))}
      </section>
      <section className="section-card declared-skills-skeleton">
        <Shape height={28} width={240} />
        <SkeletonBlock decorative lineWidths={['88%', '72%']} lines={2} variant="inline" />
        {Array.from({ length: 4 }, (_, index) => (
          <div className="declared-skill-row-skeleton" key={index}>
            <Shape height={16} width="44%" />
            <Shape height={28} rounded width={104} />
          </div>
        ))}
      </section>
    </div>
  )
}

export function WorkspaceSkeleton({ variant = 'cv-builder' }: { variant?: WorkspaceSkeletonVariant }) {
  return (
    <section aria-busy="true" aria-label="Loading workspace content" className="content-stack" role="status">
      <span className="visually-hidden">Loading workspace content</span>
      <PageHeaderSkeleton />
      {variant === 'skills' ? <SkillsWorkspaceSkeleton /> : <CvBuilderWorkspaceSkeleton />}
    </section>
  )
}
