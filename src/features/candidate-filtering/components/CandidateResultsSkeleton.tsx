import {
  SkeletonPagination,
  SkeletonShape,
  SkeletonTableGrid,
} from '../../../shared/skeletons/SkeletonPrimitives'

function ControlSkeleton() {
  return (
    <div className="skeleton-field">
      <SkeletonShape height={12} radius="pill" width="42%" />
      <SkeletonShape height={48} />
    </div>
  )
}

export function CandidateResultsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="candidate-results-skeleton skeleton-stack"
      data-testid="candidate-results-content-skeleton"
    >
      <div className="candidate-results-toolbar">
        <ControlSkeleton />
        <ControlSkeleton />
      </div>
      <SkeletonTableGrid
        columns={5}
        gridTemplateColumns="52px minmax(170px,1fr) 110px minmax(220px,1.2fr) minmax(170px,.9fr)"
        rows={5}
        testId="candidate-results-refresh-table-skeleton"
      />
      <SkeletonPagination />
    </div>
  )
}
