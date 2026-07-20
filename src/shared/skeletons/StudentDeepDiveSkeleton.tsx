import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

function IdentityPanelSkeleton() {
  return (
    <aside aria-hidden="true" className="section-card skeleton-admin-identity">
      <SkeletonShape height={92} radius="circle" width={92} />
      <SkeletonShape height={28} width="78%" />
      <SkeletonBlock decorative lineWidths={['88%', '72%', '64%']} lines={3} variant="inline" />
      <div className="skeleton-admin-metric">
        <SkeletonShape height={12} radius="pill" width="54%" />
        <SkeletonShape height={34} width="42%" />
      </div>
      <div className="skeleton-admin-metric">
        <SkeletonShape height={12} radius="pill" width="66%" />
        <SkeletonShape height={28} radius="pill" width="48%" />
      </div>
      <SkeletonShape height={42} radius="pill" width="100%" />
    </aside>
  )
}

function ReadOnlySectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section aria-hidden="true" className="section-card skeleton-stack">
      <div className="skeleton-section-heading">
        <SkeletonShape height={26} width="min(260px, 68%)" />
        <SkeletonShape height={28} radius="pill" width={94} />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-admin-readonly-row" key={index}>
          <SkeletonShape height={16} width="42%" />
          <SkeletonBlock decorative lineWidths={['92%', '68%']} lines={2} variant="inline" />
        </div>
      ))}
    </section>
  )
}

export function StudentDeepDiveSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack student-deep-dive-page"
      label="Loading Student Deep-Dive"
    >
      <SkeletonPageHeader />
      <div className="skeleton-admin-split" data-testid="student-deep-dive-skeleton">
        <IdentityPanelSkeleton />
        <div className="skeleton-stack">
          <ReadOnlySectionSkeleton rows={2} />
          <ReadOnlySectionSkeleton rows={3} />
          <ReadOnlySectionSkeleton rows={3} />
          <section aria-hidden="true" className="section-card skeleton-stack">
            <SkeletonShape height={26} width={220} />
            <SkeletonTableGrid
              columns={5}
              gridTemplateColumns="minmax(120px,.8fr) minmax(220px,1.5fr) minmax(100px,.7fr) minmax(100px,.7fr) minmax(120px,.8fr)"
              rows={4}
              testId="student-academic-records-skeleton"
            />
            <SkeletonPagination />
          </section>
          {Array.from({ length: 4 }, (_, index) => (
            <ReadOnlySectionSkeleton key={index} rows={2} />
          ))}
        </div>
      </div>
    </SkeletonStatusRegion>
  )
}
