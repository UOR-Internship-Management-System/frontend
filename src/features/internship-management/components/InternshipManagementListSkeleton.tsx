import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'

type InternshipManagementListSkeletonProps = {
  rows: 3 | 4
  variant: 'companies' | 'requests'
}

export function InternshipManagementListSkeleton({
  rows,
  variant,
}: InternshipManagementListSkeletonProps) {
  const isRequestList = variant === 'requests'

  return (
    <div
      aria-hidden="true"
      className="internship-list-skeleton"
      data-testid={`${variant}-list-skeleton`}
    >
      <div className="wireframe-row-list">
        {Array.from({ length: rows }, (_, index) => (
          <div className="wireframe-management-row" key={index}>
            <div className="wireframe-row-meta wireframe-skeleton-meta">
              <SkeletonBlock
                decorative
                height={24}
                lines={0}
                width={isRequestList ? '42%' : '34%'}
              />
              <SkeletonBlock
                decorative
                height={21}
                lines={0}
                width={isRequestList ? '64%' : '72%'}
              />
              {isRequestList ? (
                <SkeletonBlock decorative height={21} lines={0} width="54%" />
              ) : null}
            </div>
            <div className="wireframe-row-actions wireframe-skeleton-actions">
              <SkeletonBlock decorative height={42} lines={0} radius="pill" width={116} />
              <SkeletonBlock decorative height={42} lines={0} radius="pill" width={88} />
            </div>
          </div>
        ))}
      </div>

      <div className="wireframe-pagination wireframe-skeleton-pagination">
        <SkeletonBlock decorative height={12} lines={0} width={isRequestList ? 224 : 184} />
        <div>
          <SkeletonBlock decorative height={38} lines={0} radius="pill" width={104} />
          <SkeletonBlock decorative height={38} lines={0} radius="circle" width={38} />
          <SkeletonBlock decorative height={38} lines={0} radius="pill" width={88} />
        </div>
      </div>
    </div>
  )
}

export function InternshipManagementDetailsSkeleton({
  variant,
}: {
  variant: 'company' | 'request'
}) {
  const fields = variant === 'company' ? 5 : 3

  return (
    <div aria-hidden="true" className="internship-details-skeleton">
      <dl className="wireframe-details-grid">
        {Array.from({ length: fields }, (_, index) => {
          const isWide = variant === 'company' ? index === 0 : index === fields - 1
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
          <SkeletonBlock decorative height={42} lines={0} radius="pill" width={88} />
        ) : null}
        <SkeletonBlock decorative height={42} lines={0} radius="pill" width={88} />
      </div>
    </div>
  )
}
