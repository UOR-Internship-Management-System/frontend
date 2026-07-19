import {
  SkeletonMobileCards,
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

const rosterColumns =
  'minmax(140px,.9fr) minmax(220px,1.5fr) minmax(160px,1fr) minmax(120px,.7fr) minmax(110px,.7fr) minmax(150px,.9fr)'

export function RegisteredStudentsSectionSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div className="skeleton-stack">
      <div aria-hidden="true" className="skeleton-section-heading">
        <div className="skeleton-stack">
          <SkeletonShape height={28} width={205} />
          <SkeletonShape height={12} radius="pill" width={360} />
        </div>
        <SkeletonShape height={32} radius="pill" width={180} />
      </div>
      <div aria-hidden="true" className="skeleton-controls-grid">
        <div className="skeleton-field">
          <SkeletonShape height={12} radius="pill" width={175} />
          <SkeletonShape height={48} radius="md" />
        </div>
        <div className="skeleton-field">
          <SkeletonShape height={12} radius="pill" width={100} />
          <SkeletonShape height={48} radius="md" />
        </div>
      </div>
      <div aria-hidden="true" className="skeleton-chip-row" data-testid="registered-level-chips">
        <SkeletonShape height={36} radius="pill" width={92} />
        <SkeletonShape height={36} radius="pill" width={92} />
      </div>
      <SkeletonTableGrid
        columns={6}
        gridTemplateColumns={rosterColumns}
        rows={6}
        testId="registered-students-table-skeleton"
      />
      <SkeletonMobileCards count={6} />
      <SkeletonPagination />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading registered Students">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function RegisteredStudentsSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack registered-students-page"
      label="Loading Registered Students"
    >
      <SkeletonPageHeader />
      <section aria-hidden="true" className="section-card">
        <RegisteredStudentsSectionSkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
