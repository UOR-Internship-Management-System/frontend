import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import {
  SkeletonMobileCards,
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from './SkeletonPrimitives'

function FieldSkeleton({ width = '100%' }: { width?: string }) {
  return (
    <div className="skeleton-field">
      <SkeletonShape height={12} radius="pill" width="42%" />
      <SkeletonShape height={48} width={width} />
    </div>
  )
}

function ListRowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="skeleton-stack">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-admin-list-row" key={index}>
          <div className="skeleton-stack">
            <SkeletonShape height={18} width="62%" />
            <SkeletonShape height={12} radius="pill" width="86%" />
          </div>
          <SkeletonShape height={30} radius="pill" width={86} />
        </div>
      ))}
    </div>
  )
}

export function InternshipManagementSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack internship-management-page"
      label="Loading Internship Management"
    >
      <SkeletonPageHeader action />
      <div className="skeleton-admin-management-grid" data-testid="internship-management-skeleton">
        <section aria-hidden="true" className="section-card skeleton-stack">
          <div className="skeleton-section-heading">
            <SkeletonShape height={28} width={210} />
            <SkeletonShape height={40} radius="pill" width={130} />
          </div>
          <div className="skeleton-controls-grid">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <ListRowsSkeleton />
          <SkeletonPagination />
        </section>
        <section aria-hidden="true" className="section-card skeleton-stack">
          <div className="skeleton-section-heading">
            <SkeletonShape height={28} width={240} />
            <SkeletonShape height={40} radius="pill" width={150} />
          </div>
          <div className="skeleton-controls-grid">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <SkeletonTableGrid
            columns={5}
            gridTemplateColumns="minmax(200px,1.4fr) minmax(160px,1fr) minmax(110px,.7fr) minmax(120px,.8fr) minmax(120px,.8fr)"
            rows={5}
            testId="internship-requests-table-skeleton"
          />
          <SkeletonMobileCards count={5} />
          <SkeletonPagination />
        </section>
      </div>
    </SkeletonStatusRegion>
  )
}

export function CandidateFilteringSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack candidate-filtering-page"
      label="Loading Candidate Filtering"
    >
      <SkeletonPageHeader />
      <section aria-hidden="true" className="section-card skeleton-stack">
        <SkeletonShape height={24} width={230} />
        <div className="skeleton-controls-grid">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </section>
      <div className="skeleton-filtering-layout" data-testid="candidate-filtering-skeleton">
        <aside aria-hidden="true" className="section-card skeleton-stack">
          <SkeletonShape height={28} width={180} />
          <FieldSkeleton />
          <FieldSkeleton />
          <SkeletonBlock decorative lineWidths={['84%', '68%']} lines={2} variant="inline" />
          <div className="skeleton-chip-row">
            <SkeletonShape height={34} radius="pill" width={96} />
            <SkeletonShape height={34} radius="pill" width={112} />
          </div>
          <SkeletonShape height={44} radius="pill" />
        </aside>
        <section aria-hidden="true" className="section-card skeleton-stack">
          <div className="skeleton-section-heading">
            <SkeletonShape height={28} width={220} />
            <SkeletonShape height={36} radius="pill" width={148} />
          </div>
          <FieldSkeleton />
          <SkeletonTableGrid
            columns={6}
            gridTemplateColumns="64px minmax(150px,1fr) minmax(180px,1.2fr) minmax(100px,.7fr) minmax(180px,1.2fr) minmax(120px,.8fr)"
            rows={6}
            testId="candidate-results-table-skeleton"
          />
          <SkeletonMobileCards count={6} />
          <SkeletonPagination />
        </section>
      </div>
    </SkeletonStatusRegion>
  )
}

export function ShortlistExportSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack shortlists-page"
      label="Loading Shortlists and Exports"
    >
      <SkeletonPageHeader action />
      <div className="skeleton-admin-management-grid" data-testid="shortlist-export-skeleton">
        <section aria-hidden="true" className="section-card skeleton-stack">
          <SkeletonShape height={28} width={190} />
          <div className="skeleton-controls-grid">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <ListRowsSkeleton count={6} />
          <SkeletonPagination />
        </section>
        <div className="skeleton-stack">
          <section aria-hidden="true" className="section-card skeleton-stack">
            <div className="skeleton-section-heading">
              <SkeletonShape height={28} width={230} />
              <SkeletonShape height={32} radius="pill" width={110} />
            </div>
            <SkeletonTableGrid
              columns={5}
              gridTemplateColumns="minmax(160px,1fr) minmax(180px,1.2fr) minmax(100px,.7fr) minmax(120px,.8fr) minmax(120px,.8fr)"
              rows={5}
              testId="shortlist-review-table-skeleton"
            />
            <SkeletonMobileCards count={5} />
            <SkeletonPagination />
          </section>
          <section aria-hidden="true" className="section-card skeleton-stack">
            <SkeletonShape height={26} width={210} />
            <SkeletonBlock decorative lineWidths={['88%', '64%']} lines={2} variant="inline" />
            <div className="skeleton-action-row">
              <SkeletonShape height={42} radius="pill" width={160} />
              <SkeletonShape height={42} radius="pill" width={180} />
            </div>
          </section>
        </div>
      </div>
    </SkeletonStatusRegion>
  )
}
