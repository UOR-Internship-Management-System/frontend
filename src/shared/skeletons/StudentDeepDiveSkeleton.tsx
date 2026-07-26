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
      {Array.from({ length: 3 }, (_, index) => (
        <div className="skeleton-admin-readonly-row" key={index}>
          <SkeletonShape height={12} radius="pill" width="48%" />
          <SkeletonShape height={18} width="84%" />
        </div>
      ))}
      <div className="skeleton-admin-metric">
        <SkeletonShape height={12} radius="pill" width="66%" />
        <SkeletonShape height={34} width="42%" />
        <SkeletonShape height={12} radius="pill" width="88%" />
      </div>
      <div className="skeleton-admin-metric">
        <SkeletonShape height={16} width="58%" />
        <SkeletonShape height={12} radius="pill" width="86%" />
        <SkeletonShape height={42} radius="pill" width="100%" />
      </div>
    </aside>
  )
}

function ReadOnlySectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section aria-hidden="true" className="section-card skeleton-stack">
      <div className="skeleton-section-heading">
        <SkeletonShape height={26} width="min(260px, 68%)" />
        <div className="skeleton-chip-row">
          <SkeletonShape height={28} radius="pill" width={82} />
          <SkeletonShape height={28} radius="pill" width={94} />
        </div>
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
      <SkeletonPageHeader eyebrow />
      <div className="skeleton-admin-split" data-testid="student-deep-dive-skeleton">
        <IdentityPanelSkeleton />
        <div className="skeleton-stack">
          <ReadOnlySectionSkeleton rows={6} />
          <ReadOnlySectionSkeleton rows={3} />
          <ReadOnlySectionSkeleton rows={3} />
          <section aria-hidden="true" className="section-card skeleton-stack">
            <div className="skeleton-section-heading">
              <SkeletonShape height={26} width={220} />
              <div className="skeleton-chip-row">
                <SkeletonShape height={28} radius="pill" width={82} />
                <SkeletonShape height={28} radius="pill" width={94} />
              </div>
            </div>
            <SkeletonTableGrid
              columns={5}
              gridTemplateColumns="minmax(130px,.8fr) minmax(240px,1.6fr) minmax(90px,.6fr) minmax(120px,.7fr) minmax(160px,.9fr)"
              rows={5}
              testId="student-academic-records-skeleton"
            />
            <SkeletonPagination />
          </section>
          {Array.from({ length: 4 }, (_, index) => (
            <ReadOnlySectionSkeleton key={index} rows={2} />
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="student-deep-dive-footer">
        <SkeletonShape height={42} radius="pill" width={220} />
      </div>
    </SkeletonStatusRegion>
  )
}
