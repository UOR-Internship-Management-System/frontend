import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { CvVersionView, PagedCvVersions } from '../types/cvBuilderTypes'

type CvVersionPage = Omit<PagedCvVersions, 'items'> & { items: CvVersionView[] }

export function CvVersionList({
  data,
  error,
  isPending,
  onDownload,
  onPageChange,
  onRetry,
  pendingTargetKey,
}: {
  data?: CvVersionPage
  isPending: boolean
  error?: { message: string; correlationId?: string } | null
  pendingTargetKey: string | null
  onDownload: (cvVersionId: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}) {
  return (
    <SectionCard aria-labelledby="cv-versions-title" className="s5-cv-versions">
      <div className="s5-section-heading">
        <div>
          <h2 id="cv-versions-title">Saved CV versions</h2>
          <p>Immutable PDF history for your account.</p>
        </div>
      </div>
      {isPending ? (
        <div aria-label="Loading saved CV versions" role="status">
          <SkeletonBlock lines={5} />
        </div>
      ) : null}
      {error ? (
        <ErrorState
          correlationId={error.correlationId}
          message={error.message}
          onAction={onRetry}
          title="Saved versions unavailable"
        />
      ) : null}
      {!isPending && !error && data?.items.length === 0 ? (
        <EmptyState
          message="Generate and save a preview to create your first CV version."
          title="No saved versions"
        />
      ) : null}
      {!error && data?.items.length ? (
        <div className="s5-cv-version-list">
          {data.items.map((version) => (
            <article key={version.cvVersionId}>
              <div>
                <span className="s5-cv-version-title">
                  <strong>{version.versionLabel}</strong>
                  {version.latest ? <StatusBadge tone="success">Latest</StatusBadge> : null}
                  <StatusBadge tone={version.freshnessStatus === 'CURRENT' ? 'success' : 'neutral'}>
                    {version.freshnessStatus === 'CURRENT' ? 'Current' : 'Outdated'}
                  </StatusBadge>
                </span>
                <p>Saved {version.savedAtLabel}</p>
                <small>
                  {version.pdfFile.fileName} · {version.fileSizeLabel}
                </small>
              </div>
              <Button
                isLoading={pendingTargetKey === version.cvVersionId}
                onClick={() => onDownload(version.cvVersionId)}
                variant="secondary"
              >
                Download PDF
              </Button>
            </article>
          ))}
        </div>
      ) : null}
      {data ? (
        <PaginationBar
          label="Saved CV version pages"
          onPageChange={onPageChange}
          page={data.page.page}
          size={data.page.size}
          totalElements={data.page.totalElements}
          totalPages={data.page.totalPages}
        />
      ) : null}
    </SectionCard>
  )
}
