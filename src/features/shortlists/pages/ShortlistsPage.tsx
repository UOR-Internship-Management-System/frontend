import { useEffect, useMemo } from 'react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { clampPage } from '../../../shared/utils/clampPage'
import { ShortlistDetailWorkspace } from '../components/ShortlistDetailWorkspace'
import { ShortlistDirectory } from '../components/ShortlistDirectory'
import { useCompanies } from '../../internship-management/hooks/useCompanies'
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

  const shortlistQuery = useMemo(
    () => ({
      page: state.page,
      size: state.size,
      sort: state.sort,
      search: state.search,
      status: state.status,
      companyId: state.companyId,
    }),
    [state.companyId, state.page, state.search, state.size, state.sort, state.status],
  )

  const detailQuery = useMemo(
    () =>
      state.selectedShortlistId
        ? {
            shortlistId: state.selectedShortlistId,
            candidatePage: state.candidatePage,
            candidateSize: state.candidateSize,
            candidateSearch: state.candidateSearch,
            candidateSort: state.candidateSort,
          }
        : null,
    [
      state.candidatePage,
      state.candidateSearch,
      state.candidateSize,
      state.candidateSort,
      state.selectedShortlistId,
    ],
  )

  const shortlists = useShortlists(shortlistQuery)
  const detail = useShortlistDetail(detailQuery)
  const companies = useCompanies({
    page: 0,
    size: 100,
    sort: 'name,asc',
    search: '',
  })

  useEffect(() => {
    if (!shortlists.data) return
    const nextPage = clampPage(state.page, shortlists.data.page.totalElements, state.size)
    if (nextPage !== state.page) updateState({ page: nextPage })
  }, [shortlists.data, state.page, state.size, updateState])

  return (
    <div className="content-stack shortlists-page">
      <PageHeader
        description="Review manually selected candidates, manage draft membership, and inspect finalized shortlists."
        eyebrow="Administration"
        title="Shortlists"
      />

      <div className="shortlists-layout">
        <ShortlistDirectory
          companies={companies.data?.items ?? []}
          companyError={companies.error}
          companyLoading={companies.isPending}
          onSearchInputChange={setSearchInput}
          onStateChange={updateState}
          searchInput={searchInput}
          selectedShortlistId={state.selectedShortlistId}
          shortlists={shortlists}
          state={state}
        />

        <ShortlistDetailWorkspace
          candidateSearchInput={candidateSearchInput}
          detail={detail}
          onCandidateSearchInputChange={setCandidateSearchInput}
          onMissingShortlist={() =>
            updateState({
              selectedShortlistId: undefined,
            })
          }
          onStateChange={updateState}
          selectedShortlistId={state.selectedShortlistId}
          state={state}
        />
      </div>
    </div>
  )
}
