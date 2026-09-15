import { useEffect, useMemo } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card'
import { List } from '../../../shared/components/ui/List'
import { SkeletonListRows } from '../../../shared/skeletons'
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
    <Card
      aria-labelledby="active-request-matrix-title"
      className="sl-matrix-card"
      variant="outlined"
    >
      <CardHeader className="sl-section-header">
        <h2 className="m3-card-title" id="active-request-matrix-title">
          Active Request Matrix
        </h2>
      </CardHeader>
      <CardContent className="sl-matrix-content">
        <div className="sl-matrix-toolbar">
          <label className="sl-toolbar-field sl-search-field">
            <span>Search Company</span>
            <SearchBar
              aria-label="Search Company"
              maxLength={120}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search by company name..."
              value={searchInput}
            />
          </label>

          <M3SelectField
            className="sl-toolbar-field"
            label="Select Company"
            aria-describedby={companyLoadError ? 'shortlist-company-error' : undefined}
            disabled={companyLoading}
            onChange={(value) => onStateChange({ companyId: value || undefined })}
            value={state.companyId ?? ''}
            options={[
              { value: '', label: 'All Companies' },
              ...companies.map((company) => ({
                value: company.companyId,
                label: company.name,
              })),
            ]}
          />

          <M3SelectField
            className="sl-toolbar-field"
            label="Internship Track"
            onChange={(value) => onSelectedTrackChange(value)}
            value={selectedTrack}
            options={[
              { value: '', label: 'All Placement Rows' },
              ...tracks.map((track) => ({
                value: track,
                label: track,
              })),
            ]}
          />
        </div>

        {companyLoadError ? (
          <p className="sl-inline-message" id="shortlist-company-error" role="alert">
            Company options are unavailable. Search and shortlisted records remain available.
          </p>
        ) : null}
        <p aria-live="polite" className="sl-live-region">
          {shortlists.isFetching && !shortlists.isPending ? 'Updating active records…' : ''}
        </p>

        <LoadingBoundary
          isLoading={shortlists.isPending}
          label="Loading active shortlist records"
          minHeight={430}
          skeleton={<SkeletonListRows count={5} />}
        >
          {listError ? (
            <ErrorState
              correlationId={listError.correlationId}
              message={listError.message}
              onAction={() => void shortlists.refetch()}
              title="Shortlisted records unavailable"
            />
          ) : visibleShortlists.length ? (
            <List className="sl-matrix-list">
              {visibleShortlists.map((shortlist) => (
                <li className="m3-list-item sl-matrix-row" key={shortlist.shortlistId}>
                  <div className="m3-list-item-content">
                    <span className="m3-list-item-headline">{shortlist.request.title}</span>
                    <p className="sl-row-subline">
                      Company: {shortlist.request.companyName} • {shortlist.selectedCandidateCount}{' '}
                      Candidates Shortlisted
                    </p>
                  </div>
                  <span className="m3-list-item-trailing">
                    <Button
                      icon={<span className="material-symbols-outlined">visibility</span>}
                      onClick={() => onStateChange({ selectedShortlistId: shortlist.shortlistId })}
                      size="sm"
                      variant="outlined"
                    >
                      Details
                    </Button>
                  </span>
                </li>
              ))}
            </List>
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
          <PaginationBar
            label="Active request pages"
            onPageChange={(p) => onStateChange({ page: p })}
            onPageSizeChange={(s) => onStateChange({ size: s as 5 | 20 | 50 | 100 })}
            page={page.page}
            pageSizeOptions={[5, 20, 50, 100]}
            size={page.size}
            totalElements={page.totalElements}
            totalPages={page.totalPages}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
