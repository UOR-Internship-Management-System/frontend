import { useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { CompanyDeactivateDialog } from '../components/CompanyDeactivateDialog'
import { CompanyDetailsModal } from '../components/CompanyDetailsModal'
import { CompanyForm, mapCompanyToForm } from '../components/CompanyForm'
import { CompanyTable } from '../components/CompanyTable'
import { InternshipRequestWorkspace } from '../components/InternshipRequestWorkspace'
import { WireframePagination } from '../components/WireframePagination'
import {
  getCompanyMutationErrorMessage,
  useCompanies,
  useCompany,
  useCreateCompany,
  useDeactivateCompany,
  useUpdateCompany,
} from '../hooks/useCompanies'
import { useCompaniesUrlState } from '../hooks/useCompaniesUrlState'
import type { CompanyFormSubmission } from '../types/internshipManagementTypes'

type CompanyOverlay = 'create' | 'details' | 'edit' | 'delete' | null

export function InternshipManagementPage() {
  const { notify } = useNotifications()
  const { searchInput, setSearchInput, state, updateState } = useCompaniesUrlState()
  const [overlay, setOverlay] = useState<CompanyOverlay>(null)
  const [deleteError, setDeleteError] = useState<string>()
  const companies = useCompanies({
    ...state,
    page: 0,
    size: 20,
    sort: 'name,asc',
    active: undefined,
  })
  const selected = useCompany(state.selectedCompanyId ?? null)
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeactivateCompany()
  const items = companies.data?.items ?? []
  const page = Math.min(state.page, Math.max(0, Math.ceil(items.length / 3) - 1))
  const pageItems = items.slice(page * 3, page * 3 + 3)
  const formValues = useMemo(
    () => (selected.data ? mapCompanyToForm(selected.data) : undefined),
    [selected.data],
  )
  const close = () => {
    setOverlay(null)
    setDeleteError(undefined)
  }

  const createCompany = async (values: CompanyFormSubmission) => {
    const created = await createMutation.mutateAsync({
      name: values.name,
      websiteUrl: values.websiteUrl,
      contactPerson: values.contactPerson,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      notes: values.notes,
    })
    notify({ tone: 'success', title: 'Company created', message: `${created.name} was saved.` })
    updateState({ selectedCompanyId: created.companyId })
    close()
  }
  const updateCompany = async (values: CompanyFormSubmission) => {
    if (!selected.data) throw new TypeError('Load the company before updating it.')
    const saved = await updateMutation.mutateAsync({
      companyId: selected.data.companyId,
      version: selected.data.version,
      body: values,
    })
    notify({ tone: 'success', title: 'Company updated', message: `${saved.name} was saved.` })
    setOverlay('details')
  }
  const deleteCompany = async () => {
    if (!selected.data) return
    setDeleteError(undefined)
    try {
      await deleteMutation.mutateAsync({
        companyId: selected.data.companyId,
        version: selected.data.version,
      })
      notify({
        tone: 'success',
        title: 'Company deleted',
        message: `${selected.data.name} was removed.`,
      })
      updateState({ selectedCompanyId: undefined })
      close()
    } catch (reason) {
      setDeleteError(getCompanyMutationErrorMessage(reason))
    }
  }

  return (
    <div className="internship-wireframe-page">
      <PageHeader
        title="Internship Requests Management"
        description="Unified intake pipeline natively capturing corporate CRM records and placement matching parameters. Configured technical profiles compile context-aware logic keys for the deterministic candidate filtering panels directly."
      />
      <SectionCard className="internship-wireframe-card">
        <div className="internship-section-heading">
          <h2>Registered Corporate Clients</h2>
        </div>
        <div className="internship-company-toolbar">
          <SearchInput
            aria-label="Search companies by name"
            maxLength={120}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search companies by name..."
            value={searchInput}
          />
          <Button
            icon={<span className="material-symbols-outlined">add_business</span>}
            onClick={() => setOverlay('create')}
          >
            Create a Company
          </Button>
        </div>
        <LoadingBoundary
          isLoading={companies.isPending}
          label="Loading corporate clients"
          minHeight={300}
          skeleton={<SkeletonBlock height={260} lines={0} variant="card" />}
        >
          {companies.error ? (
            <ErrorState
              message={mapApiError(companies.error, 'protected').message}
              onAction={() => void companies.refetch()}
              title="Companies unavailable"
            />
          ) : pageItems.length ? (
            <>
              <CompanyTable
                companies={pageItems}
                onDelete={(id) => {
                  updateState({ selectedCompanyId: id })
                  setOverlay('delete')
                }}
                onSelect={(id) => updateState({ selectedCompanyId: id })}
                onView={(id) => {
                  updateState({ selectedCompanyId: id })
                  setOverlay('details')
                }}
                selectedCompanyId={state.selectedCompanyId}
              />
              <WireframePagination
                kind="companies"
                label="Company list pagination"
                onPageChange={(next) => updateState({ page: next })}
                page={page}
                pageSize={3}
                total={items.length}
              />
            </>
          ) : (
            <EmptyState
              message={
                state.search
                  ? 'No matching registered corporate clients were found.'
                  : 'No registered corporate clients are available.'
              }
              title={state.search ? 'No matching companies' : 'No companies yet'}
            />
          )}
        </LoadingBoundary>
      </SectionCard>
      <InternshipRequestWorkspace
        selectedCompany={selected.data}
        selectedCompanyId={state.selectedCompanyId}
      />
      {overlay === 'create' ? (
        <CompanyForm mode="create" onCancel={close} onSubmit={createCompany} />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={close} title="Corporate CRM Details Panel">
          <SkeletonBlock height={260} lines={0} variant="card" />
        </Modal>
      ) : null}
      {overlay === 'details' && selected.data ? (
        <CompanyDetailsModal
          company={selected.data}
          onClose={close}
          onDeactivate={() => setOverlay('delete')}
          onEdit={() => setOverlay('edit')}
        />
      ) : null}
      {overlay === 'edit' && selected.data && formValues ? (
        <CompanyForm
          initialValues={formValues}
          mode="edit"
          onCancel={() => setOverlay('details')}
          onSubmit={updateCompany}
        />
      ) : null}
      {overlay === 'delete' && selected.data ? (
        <CompanyDeactivateDialog
          error={deleteError}
          isPending={deleteMutation.isPending}
          onClose={close}
          onConfirm={() => void deleteCompany()}
        />
      ) : null}
    </div>
  )
}
