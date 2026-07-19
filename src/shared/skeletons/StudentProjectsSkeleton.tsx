import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import {
  SkeletonMobileCards,
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

const projectColumns =
  'minmax(260px,1.8fr) minmax(150px,.9fr) minmax(220px,1.3fr) minmax(110px,.6fr) minmax(150px,.8fr)'

export function ProjectRepositorySkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div className="skeleton-stack">
      <div aria-hidden="true" className="skeleton-controls-grid">
        <SkeletonShape height={48} radius="md" />
        <SkeletonShape height={48} radius="md" />
      </div>
      <SkeletonTableGrid
        columns={5}
        gridTemplateColumns={projectColumns}
        rows={5}
        testId="projects-table-skeleton"
      />
      <SkeletonMobileCards count={5} />
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
      <SkeletonBlock decorative lineWidths={['96%', '88%', '70%']} lines={3} variant="inline" />
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
      <div className="skeleton-chip-row">
        <SkeletonShape height={30} radius="pill" width={90} />
        <SkeletonShape height={30} radius="pill" width={118} />
        <SkeletonShape height={30} radius="pill" width={102} />
      </div>
      <SkeletonShape height={44} radius="md" />
      <div className="skeleton-modal-footer">
        <SkeletonShape height={42} radius="pill" width={116} />
        <SkeletonShape height={42} radius="pill" width={136} />
      </div>
    </div>
  )
}

export function StudentProjectsSkeleton() {
  return (
    <SkeletonStatusRegion className="content-stack" label="Loading Projects workspace">
      <SkeletonPageHeader action />
      <section aria-hidden="true" className="section-card skeleton-stack">
        <SkeletonShape height={28} width={220} />
        <ProjectRepositorySkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
