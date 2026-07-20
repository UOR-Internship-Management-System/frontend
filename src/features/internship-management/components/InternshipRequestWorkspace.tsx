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
import { clampPage } from '../../../shared/utils/clampPage'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { useCompanies } from '../hooks/useCompanies'
import {
  getInternshipRequestMutationErrorMessage,
  useCancelInternshipRequest,
  useCreateInternshipRequest,
  useInternshipRequest,
  useInternshipRequests,
  useUpdateInternshipRequest,
} from '../hooks/useInternshipRequests'
import { useInternshipRequestsUrlState } from '../hooks/useInternshipRequestsUrlState'
import type { InternshipRequestCreateInput } from '../types/internshipManagementTypes'
import { InternshipRequestCancelDialog } from './InternshipRequestCancelDialog'
import { InternshipRequestDetailsModal } from './InternshipRequestDetailsModal'
import { InternshipRequestForm, mapInternshipRequestToForm } from './InternshipRequestForm'
import { InternshipRequestTable } from './InternshipRequestTable'

type RequestOverlay = 'create' | 'details' | 'edit' | 'cancel' | null

const requestSortOptions = [
  { value: 'createdAt,desc', label: 'Recently created' },
  { value: 'title,asc', label: 'Role title · A–Z' },
  { value: 'companyName,asc', label: 'Company · A–Z' },
  { value: 'status,asc', label: 'Lifecycle status' },
] as const

const requestStatuses: Array<{ value: ApiInternshipRequestStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function InternshipRequestWorkspace() {
  const { notify } = useNotifications()
  const { searchInput, setSearchInput, state, updateState } = useInternshipRequestsUrlState()
  const [overlay, setOverlay] = useState<RequestOverlay>(() =>
    state.selectedRequestId ? 'details' : null,
  )
  const [cancellationError, setCancellationError] = useState<string>()
  const requests = useInternshipRequests(state)
  const selected = useInternshipRequest(state.selectedRequestId ?? null)
  const companyOptions = useCompanies({
    page: 0,
    size: 100,
    sort: 'name,asc',
    search: '',
  })
  const createMutation = useCreateInternshipRequest()
  const updateMutation = useUpdateInternshipRequest()
  const cancelMutation = useCancelInternshipRequest()

  useEffect(() => {
    if (state.selectedRequestId && !overlay) setOverlay('details')
    if (!state.selectedRequestId && overlay && overlay !== 'create') setOverlay(null)
  }, [overlay, state.selectedRequestId])

  useEffect(() => {
    if (!requests.data) return
    const page = clampPage(state.page, requests.data.page.totalElements, state.size)
    if (page !== state.page) updateState({ page })
  }, [requests.data, state.page, state.size, updateState])

  const hasFilters = Boolean(state.search || state.status || state.companyId)
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
    try {
      const saved = await updateMutation.mutateAsync({
        requestId: current.requestId,
        version: current.version,
        body,
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

  return (
    <>
      <SectionCard aria-labelledby="internship-request-title" className="request-workspace">
        <div className="company-workspace-heading">
          <div>
            <h2 id="internship-request-title">Internship requests</h2>
            <p>Create and maintain request metadata and deterministic skill requirements.</p>
          </div>
          <div className="request-heading-actions">
            <Chip>{requests.data?.page.totalElements ?? 0} requests</Chip>
            <Button onClick={() => setOverlay('create')}>Create request</Button>
          </div>
        </div>

        <div className="request-toolbar">
          <label>
            <span>Search requests</span>
            <SearchInput
              aria-label="Search internship requests"
              maxLength={120}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Role title or request details"
              value={searchInput}
            />
          </label>
          <label>
            <span>Company</span>
            <SelectField
              aria-label="Filter requests by company"
              disabled={companyOptions.isPending}
              onChange={(event) => updateState({ companyId: event.target.value || undefined })}
              value={state.companyId ?? ''}
            >
              <option value="">All companies</option>
              {(companyOptions.data?.items ?? []).map((company) => (
                <option key={company.companyId} value={company.companyId}>
                  {company.name}
                  {company.active ? '' : ' — Inactive'}
                </option>
              ))}
            </SelectField>
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
            <span>Sort requests</span>
            <SortSelect
              onChange={(event) => updateState({ sort: event.target.value as typeof state.sort })}
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
          minHeight={420}
          skeleton={<SkeletonBlock height={320} lines={0} variant="card" />}
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
                      updateState({ search: '', status: undefined, companyId: undefined })
                    }}
                    variant="secondary"
                  >
                    Clear request filters
                  </Button>
                ) : (
                  <Button onClick={() => setOverlay('create')}>Create first request</Button>
                )
              }
              message={
                hasFilters
                  ? 'No internship requests match the selected filters.'
                  : 'Create a request after adding approved company metadata.'
              }
              title={hasFilters ? 'No matching requests' : 'No internship requests yet'}
            />
          )}
        </LoadingBoundary>
      </SectionCard>

      {overlay === 'create' ? (
        <InternshipRequestForm
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
