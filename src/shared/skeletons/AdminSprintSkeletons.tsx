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
      <SkeletonPageHeader />
      {/* Companies section card — toolbar: search + status filter + sort select + Create Company button */}
      <section
        aria-hidden="true"
        className="section-card skeleton-stack"
        data-testid="internship-management-skeleton"
      >
        <div className="skeleton-section-heading">
          <SkeletonShape height={28} width={220} />
        </div>
        <div className="skeleton-admin-toolbar">
          <SkeletonShape height={48} width="min(340px, 100%)" />
          <SkeletonShape height={48} radius="pill" width={140} />
          <SkeletonShape height={48} radius="pill" width={148} />
          <SkeletonShape height={42} radius="pill" width={158} />
        </div>
        <ListRowsSkeleton />
        <SkeletonPagination />
      </section>
      {/* InternshipRequestWorkspace placeholder */}
      <section aria-hidden="true" className="section-card skeleton-stack">
        <div className="skeleton-section-heading">
          <SkeletonShape height={28} width={260} />
          <SkeletonShape height={40} radius="pill" width={150} />
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
      <div
        className="candidate-filtering-layout split-dashboard-pane"
        data-testid="candidate-filtering-skeleton"
      >
        {/* Left aside — two section cards matching CandidateSelectionPanel */}
        <aside aria-hidden="true" className="candidate-filtering-sidebar">
          {/* Card 1: Select Internship Request */}
          <section className="section-card skeleton-stack">
            <SkeletonShape height={28} width={210} />
            {/* "Select Internship Request" button */}
            <SkeletonShape height={44} radius="pill" />
            {/* Request context summary (3 label–value rows) */}
            {Array.from({ length: 3 }, (_, index) => (
              <div className="skeleton-stack" key={index}>
                <SkeletonShape height={12} radius="pill" width="42%" />
                <SkeletonShape height={18} width="68%" />
              </div>
            ))}
          </section>
          {/* Card 2: Filtering Panel — GPA inputs + match mode switch + skill chips */}
          <section className="section-card skeleton-stack">
            <SkeletonShape height={28} width={160} />
            {/* RuntimeGpaFilterPanel: 2 GPA fields */}
            <FieldSkeleton />
            <FieldSkeleton />
            {/* Match mode switch */}
            <SkeletonBlock decorative lineWidths={['84%', '68%']} lines={2} variant="inline" />
            <div className="skeleton-chip-row">
              <SkeletonShape height={34} radius="pill" width={96} />
              <SkeletonShape height={34} radius="pill" width={112} />
            </div>
          </section>
        </aside>
        {/* Right section — CandidateResultsWorkspace */}
        <section aria-hidden="true" className="section-card skeleton-stack">
          <div className="skeleton-section-heading">
            <SkeletonShape height={28} width={220} />
            <SkeletonShape height={36} radius="pill" width={148} />
          </div>
          {/* Toolbar: search + sort (2 controls) */}
          <div className="skeleton-controls-grid">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <SkeletonTableGrid
            columns={5}
            gridTemplateColumns="52px minmax(170px,1fr) 110px minmax(220px,1.2fr) minmax(170px,.9fr)"
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
      <SkeletonPageHeader />
      {/* ShortlistDirectory section — toolbar: search + company select + track select */}
      <section
        aria-hidden="true"
        className="section-card skeleton-stack"
        data-testid="shortlist-export-skeleton"
      >
        <div className="skeleton-section-heading">
          <SkeletonShape height={28} width={200} />
        </div>
        <div className="skeleton-admin-toolbar">
          {/* Search Company */}
          <SkeletonShape height={48} width="min(340px, 100%)" />
          {/* Select Company dropdown */}
          <SkeletonShape height={48} radius="pill" width={160} />
          {/* Internship Track dropdown */}
          <SkeletonShape height={48} radius="pill" width={168} />
        </div>
        <ListRowsSkeleton count={6} />
        <SkeletonPagination />
      </section>
    </SkeletonStatusRegion>
  )
}
