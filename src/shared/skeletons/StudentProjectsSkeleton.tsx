import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
} from './SkeletonPrimitives'

function ProjectRowSkeleton() {
  return (
    <article aria-hidden="true" className="s4-projects-item">
      <div className="s4-projects-item-content">
        <div className="s4-projects-title-line">
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
      <div className="s4-projects-item-action">
        <SkeletonShape height={42} radius="md" width={108} />
      </div>
    </article>
  )
}

export function ProjectRepositorySkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div className="skeleton-stack">
      <div aria-hidden="true" className="s4-projects-toolbar">
        <SkeletonShape height={48} radius="md" width={360} />
        <SkeletonShape height={32} radius="pill" width={104} />
      </div>
      <div className="s4-projects-list" data-testid="projects-list-skeleton">
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
    <div aria-hidden="true" className="s4-projects-details">
      <div className="s4-projects-details-status">
        <SkeletonShape height={26} radius="pill" width={110} />
        <SkeletonShape height={26} radius="pill" width={90} />
      </div>

      <div className="s4-projects-details-grid">
        <div className="s4-projects-details-wide">
          <SkeletonShape height={16} radius="pill" width={40} />
          <SkeletonShape height={20} radius="md" width={220} />
        </div>
        <div>
          <SkeletonShape height={16} radius="pill" width={70} />
          <SkeletonShape height={20} radius="md" width={100} />
        </div>
        <div>
          <SkeletonShape height={16} radius="pill" width={60} />
          <SkeletonShape height={20} radius="md" width={100} />
        </div>
        <div className="s4-projects-details-wide">
          <SkeletonShape height={16} radius="pill" width={200} />
          <SkeletonBlock decorative lineWidths={['96%', '88%', '70%']} lines={3} variant="inline" />
        </div>
      </div>

      <div className="s4-projects-details-section">
        <SkeletonShape height={18} radius="pill" width={60} />
        <div className="skeleton-chip-row">
          <SkeletonShape height={30} radius="pill" width={90} />
          <SkeletonShape height={30} radius="pill" width={118} />
          <SkeletonShape height={30} radius="pill" width={102} />
        </div>
      </div>

      <div className="s4-projects-details-section">
        <SkeletonShape height={18} radius="pill" width={100} />
        <div className="s4-projects-links">
          <SkeletonShape height={20} radius="pill" width={110} />
          <SkeletonShape height={20} radius="pill" width={90} />
        </div>
      </div>

      <div className="s4-projects-details-actions">
        <SkeletonShape height={42} radius="md" width={132} />
        <div>
          <SkeletonShape height={42} radius="md" width={92} />
          <SkeletonShape height={42} radius="md" width={92} />
        </div>
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
