import { useMemo, useState } from 'react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { useCompanies } from '../../internship-management/hooks/useCompanies'
import { ShortlistDetailWorkspace } from '../components/ShortlistDetailWorkspace'
import { ShortlistDirectory } from '../components/ShortlistDirectory'
import { useShortlistDetail, useShortlists } from '../hooks/useShortlists'
import { useShortlistsUrlState } from '../hooks/useShortlistsUrlState'

export function ShortlistsPage() {
  const {
    candidateSearchInput,
    searchInput,
    setCandidateSearchInput,
    setSearchInput,
    state,
    updateState,
  } = useShortlistsUrlState()
  const [selectedTrack, setSelectedTrack] = useState('')

  const shortlists = useShortlists({
    page: state.page,
    size: state.size,
    sort: 'updatedAt,desc',
    search: state.search,
    status: 'FINALIZED',
    companyId: state.companyId,
  })
  const detailQuery = useMemo(
    () =>
      state.selectedShortlistId
        ? {
            shortlistId: state.selectedShortlistId,
            candidatePage: 0,
            candidateSize: 100 as const,
            candidateSearch: state.candidateSearch,
            candidateSort: state.candidateSort,
          }
        : null,
    [state.candidateSearch, state.candidateSort, state.selectedShortlistId],
  )
  const detail = useShortlistDetail(detailQuery)
  const companies = useCompanies({ page: 0, size: 100, sort: 'name,asc', search: '' })

  return (
    <div className="content-stack shortlists-page">
      <PageHeader
        description="Review, filter, and track shortlisted student applications grouped by structural institutional internship requirements."
        title="Shortlisted Candidates"
      />

      <ShortlistDirectory
        companies={companies.data?.items ?? []}
        companyError={companies.error}
        companyLoading={companies.isPending}
        onSearchInputChange={setSearchInput}
        onSelectedTrackChange={setSelectedTrack}
        onStateChange={updateState}
        searchInput={searchInput}
        selectedTrack={selectedTrack}
        shortlists={shortlists}
        state={state}
      />

      {state.selectedShortlistId ? (
        <ShortlistDetailWorkspace
          candidateSearchInput={candidateSearchInput}
          detail={detail}
          onCandidateSearchInputChange={setCandidateSearchInput}
          onClose={() => updateState({ selectedShortlistId: undefined })}
          onMissingShortlist={() => updateState({ selectedShortlistId: undefined })}
          onStateChange={updateState}
          selectedShortlistId={state.selectedShortlistId}
          state={state}
        />
      ) : null}
    </div>
  )
}
