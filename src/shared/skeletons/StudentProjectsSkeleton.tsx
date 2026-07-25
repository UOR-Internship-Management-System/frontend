import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
} from './SkeletonPrimitives'

function ProjectRowSkeleton() {
  return (
    <article aria-hidden="true" className="skeleton-project-row">
      <div className="skeleton-project-row-content">
        <div className="skeleton-chip-row">
          <SkeletonShape height={24} radius="pill" width={190} />
          <SkeletonShape height={26} radius="pill" width={126} />
          <SkeletonShape height={26} radius="pill" width={94} />
        </div>
        <SkeletonShape height={14} radius="pill" width={170} />
        <SkeletonBlock decorative lineWidths={['94%', '72%']} lines={2} variant="inline" />
        <div className="skeleton-chip-row">
          <SkeletonShape height={28} radius="pill" width={84} />
          <SkeletonShape height={28} radius="pill" width={108} />
          <SkeletonShape height={28} radius="pill" width={96} />
        </div>
      </div>
      <SkeletonShape height={42} radius="md" width={108} />
    </article>
  )
}

export function ProjectRepositorySkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div className="skeleton-stack">
      <div aria-hidden="true" className="skeleton-project-toolbar">
        <SkeletonShape height={48} radius="md" />
        <SkeletonShape height={32} radius="pill" width={104} />
      </div>
      <div className="skeleton-project-list" data-testid="projects-list-skeleton">
        {Array.from({ length: 4 }, (_, index) => (
          <ProjectRowSkeleton key={index} />
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading projects">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function ProjectModalSkeleton() {
  return (
    <div aria-hidden="true" className="skeleton-project-modal">
      <SkeletonShape height={46} radius="md" />
      <SkeletonShape height={38} radius="pill" width={132} />
      <div className="skeleton-controls-grid">
        <div className="skeleton-field">
          <SkeletonShape height={12} radius="pill" width={100} />
          <SkeletonShape height={44} radius="md" />
        </div>
        <div className="skeleton-field">
          <SkeletonShape height={12} radius="pill" width={110} />
          <SkeletonShape height={44} radius="md" />
        </div>
      </div>
      <SkeletonBlock decorative lineWidths={['96%', '88%', '70%']} lines={3} variant="inline" />
      
      <div className="skeleton-field">
        <SkeletonShape height={12} radius="pill" width={120} />
        <SkeletonShape height={72} radius="md" />
      </div>

      <div className="skeleton-chip-row">
        <SkeletonShape height={30} radius="pill" width={90} />
        <SkeletonShape height={30} radius="pill" width={118} />
        <SkeletonShape height={30} radius="pill" width={102} />
      </div>
      <div className="skeleton-modal-footer">
        <SkeletonShape height={42} radius="md" width={132} />
        <SkeletonShape height={42} radius="md" width={92} />
        <SkeletonShape height={42} radius="md" width={92} />
      </div>
    </div>
  )
}

export function StudentProjectsSkeleton() {
  return (
    <SkeletonStatusRegion className="content-stack" label="Loading Projects workspace">
      <SkeletonPageHeader action />
      <section aria-hidden="true" className="section-card skeleton-stack">
        <ProjectRepositorySkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
