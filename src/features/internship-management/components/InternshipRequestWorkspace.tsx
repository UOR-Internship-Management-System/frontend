import { useEffect, useMemo, useState } from 'react'
import type { ApiInternshipRequestSort } from '../../../shared/api/generated/cvManagementApi.types'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import {
  getInternshipRequestMutationErrorMessage,
  useCreateInternshipRequest,
  useDeleteInternshipRequest,
  useInternshipRequest,
  useInternshipRequests,
  useUpdateInternshipRequest,
} from '../hooks/useInternshipRequests'
import { useInternshipRequestsUrlState } from '../hooks/useInternshipRequestsUrlState'
import type { Company, InternshipRequestCreateInput } from '../types/internshipManagementTypes'
import { InternshipRequestDeleteDialog } from './InternshipRequestDeleteDialog'
import { InternshipRequestDetailsModal } from './InternshipRequestDetailsModal'
import { InternshipRequestForm, mapInternshipRequestToForm } from './InternshipRequestForm'
import { InternshipRequestTable } from './InternshipRequestTable'
import {
  InternshipManagementDetailsSkeleton,
  InternshipManagementListSkeleton,
  InternshipRequestToolbarSkeleton,
} from './InternshipManagementListSkeleton'

type RequestOverlay = 'create' | 'details' | 'edit' | 'delete' | null

export function InternshipRequestWorkspace({
  onRetrySelectedCompany,
  selectedCompany,
  selectedCompanyError,
  selectedCompanyId,
}: {
  onRetrySelectedCompany: () => void
  selectedCompany?: Company
  selectedCompanyError?: unknown
  selectedCompanyId?: string
}) {
  const { notify } = useNotifications()
  const { searchInput, setSearchInput, state, updateState } = useInternshipRequestsUrlState()
  const [overlay, setOverlay] = useState<RequestOverlay>(null)
  const [deleteError, setDeleteError] = useState<string>()
  const resolvedPage = state.companyId === selectedCompanyId ? state.page : 0
  const requests = useInternshipRequests(
    selectedCompanyId
      ? {
          page: resolvedPage,
          size: state.size,
          sort: state.sort,
          search: state.search,
          companyId: selectedCompanyId,
        }
      : null,
  )
  const selected = useInternshipRequest(state.selectedRequestId ?? null)
  const createMutation = useCreateInternshipRequest()
  const updateMutation = useUpdateInternshipRequest()
  const deleteMutation = useDeleteInternshipRequest()
  const formValues = useMemo(
    () => (selected.data ? mapInternshipRequestToForm(selected.data) : undefined),
    [selected.data],
  )
  const hasFilters = Boolean(state.search || state.sort !== 'createdAt,desc')

  useEffect(() => {
    setOverlay(null)
    setDeleteError(undefined)
    updateState({ companyId: selectedCompanyId, selectedRequestId: undefined, page: 0 })
    // Reset only when the selected company changes. URL-state updates must not close an open dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])

  useEffect(() => {
    const totalPages = requests.data?.page.totalPages
    if (totalPages === undefined || state.page === 0) return
    if (totalPages === 0 || state.page >= totalPages) {
      updateState({ page: Math.max(0, totalPages - 1) })
    }
  }, [requests.data?.page.totalPages, state.page, updateState])

  const close = () => {
    setOverlay(null)
    setDeleteError(undefined)
    updateState({ selectedRequestId: undefined })
  }

  const choose = (requestId: string, next: RequestOverlay) => {
    updateState({ selectedRequestId: requestId })
    setOverlay(next)
  }

  const createRequest = async (body: InternshipRequestCreateInput) => {
    const created = await createMutation.mutateAsync(body)
    notify({
      tone: 'success',
      title: 'Internship request created',
      message: `${created.title} was saved.`,
    })
    updateState({ page: 0 })
    setOverlay(null)
  }

  const updateRequest = async (body: InternshipRequestCreateInput) => {
    if (!selected.data) throw new TypeError('Load the internship request before updating it.')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { companyId: _selectedCompanyId, ...updateBody } = body
    const saved = await updateMutation.mutateAsync({
      requestId: selected.data.requestId,
      version: selected.data.version,
      body: updateBody,
    })
    notify({
      tone: 'success',
      title: 'Internship request updated',
      message: `${saved.title} was saved.`,
    })
    setOverlay('details')
  }

  const deleteRequest = async () => {
    if (!selected.data) return
    setDeleteError(undefined)
    try {
      const requestTitle = selected.data.title
      await deleteMutation.mutateAsync({
        requestId: selected.data.requestId,
        version: selected.data.version,
      })
      notify({
        tone: 'success',
        title: 'Internship request deleted',
        message: `${requestTitle} was deleted.`,
      })
      close()
    } catch (reason) {
      setDeleteError(getInternshipRequestMutationErrorMessage(reason))
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    updateState({ search: '', sort: 'createdAt,desc' })
  }

  return (
    <SectionCard className="internship-wireframe-card">
      <div className="internship-section-heading">
        <div>
          <h2>Internship Requests</h2>
          {selectedCompany ? (
            <>
              <p className="internship-section-context">{selectedCompany.name}</p>
            </>
          ) : null}
        </div>
        <Button
          icon={<span className="material-symbols-outlined">playlist_add</span>}
          onClick={() => setOverlay('create')}
        >
          Create Internship Request
        </Button>
      </div>

      {!selectedCompanyId ? (
        <EmptyState
          message="Select a company from the list above to view and manage its internship requests."
          title="Select a company first"
        />
      ) : selectedCompanyError ? (
        <ErrorState
          message={mapApiError(selectedCompanyError, 'protected').message}
          onAction={onRetrySelectedCompany}
          title="Selected company unavailable"
        />
      ) : !selectedCompany ? (
        <>
          <InternshipRequestToolbarSkeleton />
          <InternshipManagementListSkeleton rows={Math.min(state.size, 5)} variant="requests" />
        </>
      ) : (
        <>
          <div className="internship-request-toolbar">
            <SearchInput
              aria-label="Search internship requests"
              maxLength={120}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by role title"
              value={searchInput}
            />
            <label className="internship-toolbar-field">
              <span>Sort requests</span>
              <SortSelect
                onChange={(event) =>
                  updateState({ sort: event.target.value as ApiInternshipRequestSort })
                }
                value={state.sort}
              >
                <option value="createdAt,desc">Newest first</option>
                <option value="title,asc">Role title A–Z</option>
              </SortSelect>
            </label>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="secondary">
                Clear Filters
              </Button>
            ) : null}
          </div>

          <LoadingBoundary
            isLoading={requests.isPending}
            label="Loading internship requests"
            skeleton={
              <InternshipManagementListSkeleton
                rows={Math.min(state.size, 5)}
                showPagination
                variant="requests"
              />
            }
          >
            {requests.error ? (
              <ErrorState
                message={mapApiError(requests.error, 'protected').message}
                onAction={() => void requests.refetch()}
                title="Internship requests unavailable"
              />
            ) : requests.data?.items.length ? (
              <>
                <InternshipRequestTable
                  onDelete={(id) => choose(id, 'delete')}
                  onSelect={(id) => choose(id, 'details')}
                  requests={requests.data.items}
                />
                <PaginationBar
                  label="Internship request pagination"
                  onPageChange={(page) => updateState({ page })}
                  page={requests.data.page.page}
                  size={requests.data.page.size}
                  totalElements={requests.data.page.totalElements}
                  totalPages={requests.data.page.totalPages}
                />
              </>
            ) : (
              <EmptyState
                action={
                  hasFilters ? (
                    <Button onClick={clearFilters} variant="secondary">
                      Clear Filters
                    </Button>
                  ) : undefined
                }
                message={
                  hasFilters
                    ? 'No internship requests match the current search and filters.'
                    : 'Create the first internship request for this company.'
                }
                title={hasFilters ? 'No matching requests' : 'No internship requests'}
              />
            )}
          </LoadingBoundary>
        </>
      )}

      {overlay === 'create' && selectedCompany ? (
        <InternshipRequestForm
          currentCompany={selectedCompany}
          mode="create"
          onCancel={() => setOverlay(null)}
          onSubmit={createRequest}
        />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={close} title="Internship Request Details">
          <InternshipManagementDetailsSkeleton variant="request" />
        </Modal>
      ) : null}
      {overlay && overlay !== 'create' && selected.error ? (
        <Modal onClose={close} title="Internship Request Details">
          <ErrorState
            message={mapApiError(selected.error, 'protected').message}
            onAction={() => void selected.refetch()}
            title="Internship request details unavailable"
          />
        </Modal>
      ) : null}
      {overlay === 'details' && selected.data ? (
        <InternshipRequestDetailsModal
          onClose={close}
          onEdit={() => setOverlay('edit')}
          request={selected.data}
        />
      ) : null}
      {overlay === 'edit' && selected.data && formValues ? (
        <InternshipRequestForm
          currentCompany={selected.data.company}
          initialValues={formValues}
          mode="edit"
          onCancel={() => setOverlay('details')}
          onSubmit={updateRequest}
        />
      ) : null}
      {overlay === 'delete' && selected.data ? (
        <InternshipRequestDeleteDialog
          error={deleteError}
          isPending={deleteMutation.isPending}
          onClose={close}
          onConfirm={() => void deleteRequest()}
          requestTitle={selected.data.title}
        />
      ) : null}
    </SectionCard>
  )
}
