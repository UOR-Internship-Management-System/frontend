import { useEffect, useMemo, useState } from 'react'
import type { ApiInternshipRequestStatus } from '../../../shared/api/generated/cvManagementApi.types'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { clampPage } from '../../../shared/utils/clampPage'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import {
  getInternshipRequestMutationErrorMessage,
  useCancelInternshipRequest,
  useCreateInternshipRequest,
  useInternshipRequest,
  useInternshipRequests,
  useUpdateInternshipRequest,
} from '../hooks/useInternshipRequests'
import { useInternshipRequestsUrlState } from '../hooks/useInternshipRequestsUrlState'
import type { Company, InternshipRequestCreateInput } from '../types/internshipManagementTypes'
import { InternshipRequestCancelDialog } from './InternshipRequestCancelDialog'
import { InternshipRequestDetailsModal } from './InternshipRequestDetailsModal'
import { InternshipRequestForm, mapInternshipRequestToForm } from './InternshipRequestForm'
import { InternshipRequestTable } from './InternshipRequestTable'

type RequestOverlay = 'create' | 'details' | 'edit' | 'cancel' | null

const requestSortOptions = [
  { value: 'createdAt,desc', label: 'Recently created' },
  { value: 'title,asc', label: 'Role title · A–Z' },
  { value: 'status,asc', label: 'Lifecycle status' },
] as const

const requestStatuses: Array<{ value: ApiInternshipRequestStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function InternshipRequestWorkspace({
  onClearCompany,
  selectedCompany,
  selectedCompanyId,
}: {
  onClearCompany: () => void
  selectedCompany?: Company
  selectedCompanyId?: string
}) {
  const { notify } = useNotifications()
  const { searchInput, setSearchInput, state, updateState } = useInternshipRequestsUrlState()
  const [overlay, setOverlay] = useState<RequestOverlay>(() =>
    state.selectedRequestId ? 'details' : null,
  )
  const [cancellationError, setCancellationError] = useState<string>()

  useEffect(() => {
    if (state.companyId === selectedCompanyId) return
    setOverlay(null)
    updateState({ companyId: selectedCompanyId, selectedRequestId: undefined })
  }, [selectedCompanyId, state.companyId, updateState])

  const requestQuery = useMemo(
    () =>
      selectedCompanyId
        ? {
            page: state.page,
            size: state.size,
            sort: state.sort,
            search: state.search,
            status: state.status,
            companyId: selectedCompanyId,
          }
        : null,
    [selectedCompanyId, state.page, state.search, state.size, state.sort, state.status],
  )

  const requests = useInternshipRequests(requestQuery)
  const selected = useInternshipRequest(state.selectedRequestId ?? null)
  const createMutation = useCreateInternshipRequest()
  const updateMutation = useUpdateInternshipRequest()
  const cancelMutation = useCancelInternshipRequest()

  useEffect(() => {
    if (state.selectedRequestId && !overlay) setOverlay('details')
    if (!state.selectedRequestId && overlay && overlay !== 'create') setOverlay(null)
  }, [overlay, state.selectedRequestId])

  useEffect(() => {
    if (!requests.data || !requestQuery) return
    const page = clampPage(state.page, requests.data.page.totalElements, state.size)
    if (page !== state.page) updateState({ page })
  }, [requestQuery, requests.data, state.page, state.size, updateState])

  const hasFilters = Boolean(state.search || state.status)
  const mappedListError = requests.error ? mapApiError(requests.error, 'protected') : null
  const selectedFormValues = useMemo(
    () => (selected.data ? mapInternshipRequestToForm(selected.data) : undefined),
    [selected.data],
  )

  const closeSelected = () => {
    setOverlay(null)
    setCancellationError(undefined)
    updateState({ selectedRequestId: undefined })
  }

  const createRequest = async (body: InternshipRequestCreateInput) => {
    if (!selectedCompany || body.companyId !== selectedCompany.companyId) {
      throw new TypeError('Select an active company before creating an internship request.')
    }
    const created = await createMutation.mutateAsync(body)
    notify({
      tone: 'success',
      title: 'Internship request created',
      message: `${created.title} was added for ${created.company.name}.`,
    })
    updateState({ selectedRequestId: created.requestId })
    setOverlay('details')
  }

  const updateRequest = async (body: InternshipRequestCreateInput) => {
    const current = selected.data
    if (!current) throw new TypeError('Load the internship request before updating it.')
    if (body.companyId !== current.company.companyId) {
      throw new TypeError('An internship request cannot be reassigned to another company.')
    }
    try {
      const saved = await updateMutation.mutateAsync({
        requestId: current.requestId,
        version: current.version,
        body: { ...body, companyId: undefined },
      })
      notify({
        tone: 'success',
        title: 'Internship request updated',
        message: `${saved.title} was saved.`,
      })
      setOverlay('details')
    } catch (reason) {
      const status = mapApiError(reason, 'protected').status
      if (status === 404) {
        closeSelected()
        await requests.refetch()
      } else if (status === 412 || status === 428) {
        await Promise.all([selected.refetch(), requests.refetch()])
      }
      throw reason
    }
  }

  const cancelRequest = async () => {
    const current = selected.data
    if (!current) return
    setCancellationError(undefined)
    try {
      await cancelMutation.mutateAsync({
        requestId: current.requestId,
        version: current.version,
      })
      notify({
        tone: 'success',
        title: 'Internship request cancelled',
        message: `${current.title} is no longer active.`,
      })
      closeSelected()
    } catch (reason) {
      const status = mapApiError(reason, 'protected').status
      setCancellationError(getInternshipRequestMutationErrorMessage(reason))
      if (status === 412 || status === 428) {
        await Promise.all([selected.refetch(), requests.refetch()])
      }
      if (status === 404) {
        closeSelected()
        await requests.refetch()
      }
    }
  }

  const canCreate = Boolean(selectedCompany?.active)

  return (
    <>
      <SectionCard aria-labelledby="internship-request-title" className="request-workspace">
        <div className="company-workspace-heading request-workspace-heading">
          <div>
            <h2 id="internship-request-title">Internship requests created</h2>
            <p>
              {selectedCompany
                ? `Showing requests for ${selectedCompany.name}.`
                : 'Select a corporate client above to manage its placement requests.'}
            </p>
          </div>
          <div className="request-heading-actions">
            {selectedCompany ? (
              <StatusBadge tone={selectedCompany.active ? 'success' : 'neutral'}>
                {selectedCompany.active ? 'Active company' : 'Inactive company'}
              </StatusBadge>
            ) : null}
            <Chip>{requests.data?.page.totalElements ?? 0} requests</Chip>
            <Button disabled={!canCreate} icon={<span className="material-symbols-outlined">playlist_add</span>} onClick={() => setOverlay('create')}>
              Create internship request
            </Button>
          </div>
        </div>

        {selectedCompany ? (
          <div className="selected-company-context" role="status">
            <div>
              <span>Selected corporate client</span>
              <strong>{selectedCompany.name}</strong>
            </div>
            <div>
              <span>Primary contact</span>
              <strong>
                {selectedCompany.contactPerson || selectedCompany.contactEmail || 'Not provided'}
              </strong>
            </div>
            <Button onClick={onClearCompany} variant="secondary">
              Change company
            </Button>
          </div>
        ) : null}

        {!selectedCompanyId ? (
          <EmptyState
            message="Select a corporate client profile from the list above to explore and create its internship placement requests."
            title="Select a company first"
          />
        ) : !selectedCompany ? (
          <LoadingBoundary
            isLoading
            label="Loading selected company"
            minHeight={220}
            skeleton={<SkeletonBlock height={180} lines={0} variant="card" />}
          >
            <div />
          </LoadingBoundary>
        ) : (
          <>
            <div className="request-toolbar wireframe-toolbar">
              <label className="wireframe-toolbar-search">
                <span className="visually-hidden">Search requests</span>
                <SearchInput
                  aria-label="Search internship requests"
                  maxLength={120}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search role title or request details"
                  value={searchInput}
                />
              </label>
              <label>
                <span>Lifecycle status</span>
                <SelectField
                  aria-label="Filter requests by lifecycle status"
                  onChange={(event) =>
                    updateState({
                      status:
                        event.target.value === 'ALL'
                          ? undefined
                          : (event.target.value as ApiInternshipRequestStatus),
                    })
                  }
                  value={state.status ?? 'ALL'}
                >
                  {requestStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </SelectField>
              </label>
              <label>
                <span>Sort</span>
                <SortSelect
                  onChange={(event) =>
                    updateState({ sort: event.target.value as typeof state.sort })
                  }
                  value={state.sort}
                >
                  {requestSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SortSelect>
              </label>
            </div>

            <p aria-live="polite" className="company-updating">
              {requests.isFetching && !requests.isPending ? 'Updating internship requests…' : ''}
            </p>

            <LoadingBoundary
              isLoading={requests.isPending}
              label="Loading internship requests"
              minHeight={360}
              skeleton={<SkeletonBlock height={280} lines={0} variant="card" />}
            >
              {mappedListError ? (
                <ErrorState
                  correlationId={mappedListError.correlationId}
                  message={mappedListError.message}
                  onAction={() => void requests.refetch()}
                  title="Internship requests unavailable"
                />
              ) : requests.data?.items.length ? (
                <>
                  <InternshipRequestTable
                    onSelect={(requestId) => {
                      updateState({ selectedRequestId: requestId })
                      setOverlay('details')
                    }}
                    requests={requests.data.items}
                  />
                  <PaginationBar
                    label="Internship request pages"
                    onPageChange={(page) => updateState({ page })}
                    onPageSizeChange={(size) => updateState({ size: size as 20 | 50 | 100 })}
                    page={requests.data.page.page}
                    pageSizeOptions={[20, 50, 100]}
                    size={requests.data.page.size}
                    totalElements={requests.data.page.totalElements}
                    totalPages={requests.data.page.totalPages}
                  />
                </>
              ) : (
                <EmptyState
                  action={
                    hasFilters ? (
                      <Button
                        onClick={() => {
                          setSearchInput('')
                          updateState({ search: '', status: undefined })
                        }}
                        variant="secondary"
                      >
                        Clear request filters
                      </Button>
                    ) : canCreate ? (
                      <Button onClick={() => setOverlay('create')}>Create first request</Button>
                    ) : undefined
                  }
                  message={
                    hasFilters
                      ? 'No internship requests match the selected filters.'
                      : selectedCompany.active
                        ? `Create the first internship request for ${selectedCompany.name}.`
                        : 'Inactive companies retain historical requests but cannot receive new ones.'
                  }
                  title={hasFilters ? 'No matching requests' : 'No internship requests yet'}
                />
              )}
            </LoadingBoundary>
          </>
        )}
      </SectionCard>

      {overlay === 'create' && selectedCompany?.active ? (
        <InternshipRequestForm
          currentCompany={selectedCompany}
          lockCompany
          mode="create"
          onCancel={() => setOverlay(null)}
          onSubmit={createRequest}
        />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={closeSelected} title="Internship request details">
          <SkeletonBlock height={300} lines={0} variant="card" />
        </Modal>
      ) : null}
      {overlay && overlay !== 'create' && selected.error ? (
        <Modal onClose={closeSelected} title="Internship request unavailable">
          <ErrorState
            message={mapApiError(selected.error, 'protected').message}
            onAction={() => void selected.refetch()}
            title="Unable to load internship request"
          />
        </Modal>
      ) : null}
      {overlay === 'details' && selected.data ? (
        <InternshipRequestDetailsModal
          onCancelRequest={() => {
            setCancellationError(undefined)
            setOverlay('cancel')
          }}
          onClose={closeSelected}
          onEdit={() => setOverlay('edit')}
          request={selected.data}
        />
      ) : null}
      {overlay === 'edit' && selected.data && selectedFormValues ? (
        <InternshipRequestForm
          currentCompany={selected.data.company}
          initialValues={selectedFormValues}
          lockCompany
          mode="edit"
          onCancel={() => setOverlay('details')}
          onSubmit={updateRequest}
        />
      ) : null}
      {overlay === 'cancel' && selected.data ? (
        <InternshipRequestCancelDialog
          error={cancellationError}
          isPending={cancelMutation.isPending}
          onClose={() => setOverlay('details')}
          onConfirm={() => void cancelRequest()}
          request={selected.data}
        />
      ) : null}
    </>
  )
}