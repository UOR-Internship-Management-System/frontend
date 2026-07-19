import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import {
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

const recordColumns =
  'minmax(90px,.7fr) minmax(180px,1.5fr) repeat(5,minmax(110px,.85fr)) minmax(130px,1fr) minmax(100px,.7fr)'

export function AcademicGpaSkeleton({ announce = true }: { announce?: boolean }) {
  const content = (
    <div aria-hidden="true" className="skeleton-gpa-grid" data-testid="academic-gpa-cards">
      {Array.from({ length: 3 }, (_, index) => (
        <article
          className="s5-records-gpa-card skeleton-card-stack"
          data-skeleton-gpa-card
          key={index}
        >
          <div className="skeleton-section-heading">
            <SkeletonShape height={12} radius="pill" width="48%" />
            {index === 0 ? <SkeletonShape height={28} radius="pill" width={82} /> : null}
          </div>
          <SkeletonShape height={38} width="42%" />
          <SkeletonShape height={12} radius="pill" width="74%" />
        </article>
      ))}
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
        <div aria-hidden="true" className="skeleton-controls-grid">
          <div className="skeleton-field">
            <SkeletonShape height={12} radius="pill" width={150} />
            <SkeletonShape height={48} radius="md" />
          </div>
          <div className="skeleton-field">
            <SkeletonShape height={12} radius="pill" width={120} />
            <SkeletonShape height={48} radius="md" />
          </div>
        </div>
      ) : null}
      <SkeletonTableGrid
        columns={9}
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
      <section aria-hidden="true" className="section-card s5-records-gpa-section skeleton-stack">
        <div className="skeleton-section-heading">
          <div className="skeleton-stack">
            <SkeletonShape height={12} radius="pill" width={150} />
            <SkeletonShape height={28} width={220} />
            <SkeletonBlock decorative lineWidths={['360px']} lines={1} variant="inline" />
          </div>
          <SkeletonShape height={34} radius="pill" width={126} />
        </div>
        <AcademicGpaSkeleton announce={false} />
      </section>
      <section aria-hidden="true" className="section-card s5-records-list-section skeleton-stack">
        <div className="skeleton-stack">
          <SkeletonShape height={12} radius="pill" width={140} />
          <SkeletonShape height={28} width={230} />
          <SkeletonShape height={12} radius="pill" width={410} />
        </div>
        <AcademicRecordsTableSkeleton announce={false} />
      </section>
    </SkeletonStatusRegion>
  )
}
