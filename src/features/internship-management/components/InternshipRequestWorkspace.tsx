import { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
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
import {
  InternshipManagementDetailsSkeleton,
  InternshipManagementListSkeleton,
} from './InternshipManagementListSkeleton'
import { WireframePagination } from './WireframePagination'

type RequestOverlay = 'create' | 'details' | 'edit' | 'delete' | null

export function InternshipRequestWorkspace({
  selectedCompany,
  selectedCompanyId,
}: {
  onClearCompany?: () => void
  selectedCompany?: Company
  selectedCompanyId?: string
}) {
  const { notify } = useNotifications()
  const { state, updateState } = useInternshipRequestsUrlState()
  const [overlay, setOverlay] = useState<RequestOverlay>(null)
  const [deleteError, setDeleteError] = useState<string>()
  const requests = useInternshipRequests(
    selectedCompanyId
      ? { page: 0, size: 20, sort: 'createdAt,desc', search: '', companyId: selectedCompanyId }
      : null,
  )
  const selected = useInternshipRequest(state.selectedRequestId ?? null)
  const createMutation = useCreateInternshipRequest()
  const updateMutation = useUpdateInternshipRequest()
  const deleteMutation = useCancelInternshipRequest()
  const items = requests.data?.items ?? []
  const page = Math.min(state.page, Math.max(0, Math.ceil(items.length / 4) - 1))
  const pageItems = items.slice(page * 4, page * 4 + 4)
  const formValues = useMemo(
    () => (selected.data ? mapInternshipRequestToForm(selected.data) : undefined),
    [selected.data],
  )

  useEffect(() => {
    setOverlay(null)
    updateState({ companyId: selectedCompanyId, selectedRequestId: undefined, page: 0 })
    // Reset this workspace only when the selected company actually changes.
    // `updateState` changes identity whenever URL state changes and must not close an open dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])
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
      message: `${created.title} was added.`,
    })
    setOverlay(null)
  }
  const updateRequest = async (body: InternshipRequestCreateInput) => {
    if (!selected.data) throw new TypeError('Load the internship request before updating it.')
    const saved = await updateMutation.mutateAsync({
      requestId: selected.data.requestId,
      version: selected.data.version,
      body: { ...body, companyId: undefined },
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
      await deleteMutation.mutateAsync({
        requestId: selected.data.requestId,
        version: selected.data.version,
      })
      notify({
        tone: 'success',
        title: 'Internship request deleted',
        message: `${selected.data.title} was removed.`,
      })
      close()
    } catch (reason) {
      setDeleteError(getInternshipRequestMutationErrorMessage(reason))
    }
  }

  return (
    <SectionCard className="internship-wireframe-card">
      <div className="internship-section-heading">
        <h2>Internship requests created</h2>
        <Button
          disabled={!selectedCompany?.active}
          icon={<span className="material-symbols-outlined">playlist_add</span>}
          onClick={() => setOverlay('create')}
        >
          Create internship request
        </Button>
      </div>
      {!selectedCompanyId ? (
        <EmptyState
          message="Select a corporate client profile from the list above to explore active internship placement requests."
          title="Select a company first"
        />
      ) : !selectedCompany ? (
        <InternshipManagementListSkeleton rows={4} variant="requests" />
      ) : (
        <LoadingBoundary
          isLoading={requests.isPending}
          label="Loading internship requests"
          skeleton={<InternshipManagementListSkeleton rows={4} variant="requests" />}
        >
          {requests.error ? (
            <ErrorState
              message={mapApiError(requests.error, 'protected').message}
              onAction={() => void requests.refetch()}
              title="Internship requests unavailable"
            />
          ) : pageItems.length ? (
            <>
              <InternshipRequestTable
                onDelete={(id) => choose(id, 'delete')}
                onSelect={(id) => choose(id, 'details')}
                requests={pageItems}
              />
              <WireframePagination
                kind="internship requests"
                label="Internship request pagination"
                onPageChange={(next) => updateState({ page: next })}
                page={page}
                pageSize={4}
                total={items.length}
              />
            </>
          ) : (
            <EmptyState
              message="No active internship requirements generated for this profile currently. Click “Create internship request” above to append setup options."
              title="No internship requests"
            />
          )}
        </LoadingBoundary>
      )}
      {overlay === 'create' && selectedCompany ? (
        <InternshipRequestForm
          currentCompany={selectedCompany}
          lockCompany
          mode="create"
          onCancel={() => setOverlay(null)}
          onSubmit={createRequest}
        />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={close} title="Candidate Selection Criteria">
          <InternshipManagementDetailsSkeleton variant="request" />
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
          lockCompany
          mode="edit"
          onCancel={() => setOverlay('details')}
          onSubmit={updateRequest}
        />
      ) : null}
      {overlay === 'delete' && selected.data ? (
        <InternshipRequestCancelDialog
          error={deleteError}
          isPending={deleteMutation.isPending}
          onClose={close}
          onConfirm={() => void deleteRequest()}
        />
      ) : null}
    </SectionCard>
  )
}
