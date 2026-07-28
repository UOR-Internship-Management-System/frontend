import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

const recordColumns =
  'minmax(110px,.8fr) minmax(240px,1.8fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(110px,.8fr)'

export function AcademicGpaSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div
      aria-hidden="true"
      className="s5-records-gpa-summary"
      data-skeleton-gpa-card
      data-testid="academic-gpa-card"
    >
      <div className="s5-records-gpa-icon">
        <SkeletonShape height={32} radius="sm" width={32} />
      </div>
      <div className="s5-records-gpa-meta">
        <SkeletonShape height={14} radius="pill" width={180} />
        <SkeletonShape height={48} width={120} />
      </div>
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading official GPA">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function AcademicRecordsTableSkeleton({
  announce = true,
  includeToolbar = true,
}: {
  announce?: boolean
  includeToolbar?: boolean
}) {
  const content = (
    <div className="skeleton-stack">
      {includeToolbar ? (
        <div aria-hidden="true" className="s5-records-search">
          <SkeletonShape height={48} radius="md" />
        </div>
      ) : null}
      <SkeletonTableGrid
        columns={5}
        gridTemplateColumns={recordColumns}
        rows={5}
        testId="academic-records-table-skeleton"
      />
      <SkeletonPagination />
    </div>
  )
  return announce ? (
    <SkeletonStatusRegion label="Loading academic records">{content}</SkeletonStatusRegion>
  ) : (
    content
  )
}

export function AcademicRecordsSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack s5-records-page"
      label="Loading Academic Records"
    >
      <SkeletonPageHeader />
      <section aria-hidden="true" className="section-card s5-records-gpa-section">
        <AcademicGpaSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card s5-records-list-section skeleton-stack">
        <AcademicRecordsTableSkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
