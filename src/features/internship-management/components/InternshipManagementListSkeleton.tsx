import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'

type InternshipManagementListSkeletonProps = {
  rows: number
  variant: 'companies' | 'requests'
  showPagination?: boolean
}

function InternshipManagementPaginationSkeleton() {
  return (
    <div aria-hidden="true" className="pagination-bar internship-pagination-skeleton">
      <SkeletonBlock
        className="internship-pagination-summary-skeleton"
        decorative
        height={14}
        lines={0}
        radius="pill"
        width={190}
      />
      <div className="pagination-actions internship-pagination-actions-skeleton">
        <SkeletonBlock decorative height={42} lines={0} radius="pill" width={104} />
        <SkeletonBlock decorative height={42} lines={0} radius="pill" width={82} />
      </div>
    </div>
  )
}

export function InternshipRequestToolbarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="internship-request-toolbar internship-request-toolbar-skeleton"
      data-testid="requests-toolbar-skeleton"
    >
      <SkeletonBlock
        className="internship-toolbar-search-skeleton"
        decorative
        height={48}
        lines={0}
        radius="pill"
        width="100%"
      />
      <div className="internship-toolbar-field internship-toolbar-field-skeleton">
        <SkeletonBlock decorative height={12} lines={0} radius="pill" width={54} />
        <SkeletonBlock decorative height={48} lines={0} radius="md" width="100%" />
      </div>
      <div className="internship-toolbar-field internship-toolbar-field-skeleton">
        <SkeletonBlock decorative height={12} lines={0} radius="pill" width={92} />
        <SkeletonBlock decorative height={48} lines={0} radius="md" width="100%" />
      </div>
    </div>
  )
}

export function InternshipManagementListSkeleton({
  rows,
  showPagination = false,
  variant,
}: InternshipManagementListSkeletonProps) {
  const isRequestList = variant === 'requests'
  const safeRows = Math.max(1, Math.floor(rows))

  return (
    <div
      aria-hidden="true"
      className="internship-list-skeleton"
      data-testid={`${variant}-list-skeleton`}
    >
      <div className="wireframe-row-list">
        {Array.from({ length: safeRows }, (_, index) => (
          <div className="wireframe-management-row" key={index}>
            <div className="wireframe-row-meta wireframe-skeleton-meta">
              <div className="request-row-title wireframe-skeleton-title-row">
                <SkeletonBlock
                  className="wireframe-skeleton-title"
                  decorative
                  height={24}
                  lines={0}
                  width={isRequestList ? '42%' : '34%'}
                />
                <SkeletonBlock
                  className="wireframe-skeleton-status"
                  decorative
                  height={28}
                  lines={0}
                  radius="pill"
                  width={isRequestList ? 76 : 68}
                />
              </div>
              <SkeletonBlock
                decorative
                height={18}
                lines={0}
                width={isRequestList ? '64%' : '72%'}
              />
              {isRequestList ? (
                <div className="wireframe-skeleton-skills" data-testid="request-skills-skeleton">
                  <SkeletonBlock decorative height={18} lines={0} width="76%" />
                  <SkeletonBlock decorative height={18} lines={0} width="48%" />
                </div>
              ) : null}
            </div>
            <div className="wireframe-row-actions wireframe-skeleton-actions">
              <SkeletonBlock
                className="wireframe-skeleton-action wireframe-skeleton-action-view"
                decorative
                height={42}
                lines={0}
                radius="pill"
                width={140}
              />
              <SkeletonBlock
                className="wireframe-skeleton-action wireframe-skeleton-action-delete"
                decorative
                height={42}
                lines={0}
                radius="pill"
                width={isRequestList ? 240 : 166}
              />
            </div>
          </div>
        ))}
      </div>

      {showPagination ? <InternshipManagementPaginationSkeleton /> : null}
    </div>
  )
}

export function InternshipManagementDetailsSkeleton({
  variant,
}: {
  variant: 'company' | 'request'
}) {
  const fields = variant === 'company' ? 7 : 6

  return (
    <div aria-hidden="true" className="internship-details-skeleton">
      <dl className="wireframe-details-grid">
        {Array.from({ length: fields }, (_, index) => {
          let isWide = false
          if (variant === 'company') {
            // Company Name (0) and Internal Notes (6) span both columns.
            isWide = index === 0 || index === 6
          } else {
            // Role Title (0), Company (1), Role Description (4), and Required Skills (5).
            isWide = index === 0 || index === 1 || index === 4 || index === 5
          }
          return (
            <div className={isWide ? 'wireframe-details-wide' : undefined} key={index}>
              <dt>
                <SkeletonBlock decorative height={18} lines={0} width={isWide ? 240 : 148} />
              </dt>
              <dd>
                <SkeletonBlock decorative height={14} lines={0} width={isWide ? '62%' : '76%'} />
              </dd>
            </div>
          )
        })}
      </dl>
      <div className="modal-actions internship-details-skeleton-actions">
        <SkeletonBlock decorative height={42} lines={0} radius="pill" width={84} />
        {variant === 'company' ? (
          <SkeletonBlock decorative height={42} lines={0} radius="pill" width={166} />
        ) : null}
        <SkeletonBlock decorative height={42} lines={0} radius="pill" width={100} />
      </div>
    </div>
  )
}
