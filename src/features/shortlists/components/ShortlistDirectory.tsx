import { useEffect, useMemo } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import type { Company } from '../../internship-management/types/internshipManagementTypes'
import type { useShortlists } from '../hooks/useShortlists'
import type { ShortlistsUrlState } from '../types/shortlistTypes'

type ShortlistListQuery = ReturnType<typeof useShortlists>

export function ShortlistDirectory({
  companies,
  companyError,
  companyLoading,
  onSearchInputChange,
  onSelectedTrackChange,
  onStateChange,
  searchInput,
  selectedTrack,
  shortlists,
  state,
}: {
  companies: Company[]
  companyError?: unknown
  companyLoading: boolean
  onSearchInputChange: (value: string) => void
  onSelectedTrackChange: (value: string) => void
  onStateChange: (patch: Partial<ShortlistsUrlState>) => void
  searchInput: string
  selectedTrack: string
  shortlists: ShortlistListQuery
  state: ShortlistsUrlState
}) {
  const listError = shortlists.isError ? mapApiError(shortlists.error, 'protected') : null
  const companyLoadError = companyError ? mapApiError(companyError, 'protected') : null
  const tracks = useMemo(
    () =>
      [...new Set((shortlists.data?.items ?? []).map((shortlist) => shortlist.request.title))].sort(
        (left, right) => left.localeCompare(right),
      ),
    [shortlists.data?.items],
  )
  const visibleShortlists = useMemo(
    () =>
      (shortlists.data?.items ?? []).filter(
        (shortlist) => !selectedTrack || shortlist.request.title === selectedTrack,
      ),
    [selectedTrack, shortlists.data?.items],
  )
  const page = shortlists.data?.page

  useEffect(() => {
    if (!page || page.totalPages === 0 || state.page < page.totalPages) return
    onStateChange({ page: page.totalPages - 1 })
  }, [onStateChange, page, state.page])

  return (
    <section aria-labelledby="active-request-matrix-title" className="shortlist-matrix-card">
      <div className="shortlist-section-header">
        <h2 id="active-request-matrix-title">Active Request Matrix</h2>
      </div>

      <div className="shortlist-matrix-toolbar">
        <label className="shortlist-control shortlist-search-control">
          <span>Search Company</span>
          <span className="shortlist-search-input">
            <span aria-hidden="true" className="material-symbols-outlined">
              search
            </span>
            <input
              aria-label="Search Company"
              maxLength={120}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search by company name..."
              type="search"
              value={searchInput}
            />
          </span>
        </label>

        <label className="shortlist-control">
          <span>Select Company</span>
          <select
            aria-describedby={companyLoadError ? 'shortlist-company-error' : undefined}
            disabled={companyLoading}
            onChange={(event) => onStateChange({ companyId: event.target.value || undefined })}
            value={state.companyId ?? ''}
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.name}
              </option>
            ))}
          </select>
        </label>

        <label className="shortlist-control">
          <span>Internship Track</span>
          <select
            onChange={(event) => onSelectedTrackChange(event.target.value)}
            value={selectedTrack}
          >
            <option value="">All Placement Rows</option>
            {tracks.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </label>
      </div>

      {companyLoadError ? (
        <p className="shortlist-inline-message" id="shortlist-company-error" role="alert">
          Company options are unavailable. Search and shortlisted records remain available.
        </p>
      ) : null}
      <p aria-live="polite" className="shortlist-live-region">
        {shortlists.isFetching && !shortlists.isPending ? 'Updating active records…' : ''}
      </p>

      <LoadingBoundary
        isLoading={shortlists.isPending}
        label="Loading active shortlist records"
        minHeight={430}
        skeleton={<SkeletonBlock height={390} lines={0} variant="card" />}
      >
        {listError ? (
          <ErrorState
            correlationId={listError.correlationId}
            message={listError.message}
            onAction={() => void shortlists.refetch()}
            title="Shortlisted records unavailable"
          />
        ) : visibleShortlists.length ? (
          <div className="shortlist-matrix-list">
            {visibleShortlists.map((shortlist) => (
              <article className="shortlist-matrix-row" key={shortlist.shortlistId}>
                <div>
                  <h3>{shortlist.request.title}</h3>
                  <p>
                    Company: {shortlist.request.companyName} • {shortlist.selectedCandidateCount}{' '}
                    Candidates Shortlisted
                  </p>
                </div>
                <button
                  className="shortlist-outlined-button"
                  onClick={() => onStateChange({ selectedShortlistId: shortlist.shortlistId })}
                  type="button"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    visibility
                  </span>
                  Details
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              selectedTrack
                ? 'No shortlisted records on this page match the selected internship track.'
                : 'No finalized shortlisted records match the current company filters.'
            }
            title="No shortlisted records"
          />
        )}
      </LoadingBoundary>

      {page && page.totalPages > 0 ? (
        <nav aria-label="Active request pages" className="shortlist-pagination">
          <p>
            Showing {page.page * page.size + 1} to{' '}
            {Math.min((page.page + 1) * page.size, page.totalElements)} of {page.totalElements}{' '}
            active records
          </p>
          <div>
            <button
              aria-label="Previous page"
              disabled={page.page === 0}
              onClick={() => onStateChange({ page: page.page - 1 })}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_left
              </span>
            </button>
            {Array.from({ length: page.totalPages }, (_, index) => (
              <button
                aria-current={index === page.page ? 'page' : undefined}
                className={index === page.page ? 'is-active' : undefined}
                key={index}
                onClick={() => onStateChange({ page: index })}
                type="button"
              >
                {index + 1}
              </button>
            ))}
            <button
              aria-label="Next page"
              disabled={page.page >= page.totalPages - 1}
              onClick={() => onStateChange({ page: page.page + 1 })}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  )
}
