import { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { CompanyDeleteDialog } from '../components/CompanyDeleteDialog'
import { CompanyDetailsModal } from '../components/CompanyDetailsModal'
import { CompanyForm, mapCompanyToForm } from '../components/CompanyForm'
import { CompanyTable } from '../components/CompanyTable'
import { InternshipRequestWorkspace } from '../components/InternshipRequestWorkspace'
import {
  InternshipManagementDetailsSkeleton,
  InternshipManagementListSkeleton,
} from '../components/InternshipManagementListSkeleton'
import {
  getCompanyMutationErrorMessage,
  useCompanies,
  useCompany,
  useCreateCompany,
  useDeleteCompany,
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
    page: state.page,
    size: state.size,
    sort: state.sort,
    search: state.search,
    active: state.active,
  })
  const selected = useCompany(state.selectedCompanyId ?? null)
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()
  const formValues = useMemo(
    () => (selected.data ? mapCompanyToForm(selected.data) : undefined),
    [selected.data],
  )
  const hasCompanyFilters = Boolean(
    state.search || state.active !== true || state.sort !== 'name,asc',
  )

  useEffect(() => {
    document.title = 'Internship Requests Management | CV Management & Filtering System'
  }, [])

  useEffect(() => {
    const totalPages = companies.data?.page.totalPages
    if (totalPages === undefined || state.page === 0) return
    if (totalPages === 0 || state.page >= totalPages) {
      updateState({ page: Math.max(0, totalPages - 1) })
    }
  }, [companies.data?.page.totalPages, state.page, updateState])

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
    updateState({ selectedCompanyId: created.companyId, page: 0 })
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
      const companyName = selected.data.name
      await deleteMutation.mutateAsync({
        companyId: selected.data.companyId,
        version: selected.data.version,
      })
      notify({
        tone: 'success',
        title: 'Company deleted',
        message: `${companyName} and its internship requests were deleted.`,
      })
      updateState({ selectedCompanyId: undefined, page: 0 })
      close()
    } catch (reason) {
      setDeleteError(getCompanyMutationErrorMessage(reason))
    }
  }

  const clearCompanyFilters = () => {
    setSearchInput('')
    updateState({ search: '', active: true, sort: 'name,asc', selectedCompanyId: undefined })
  }

  const emptyCompanyMessage =
    state.active === false
      ? 'No inactive companies match the current controls.'
      : state.active === undefined
        ? 'No companies match the current controls.'
        : state.search
          ? 'No active companies match the current search.'
          : 'Create the first company before adding internship requests.'

  return (
    <div className="internship-wireframe-page">
      <PageHeader
        title="Internship Requests Management"
        description="Manage external company metadata and internship requests used by deterministic candidate filtering. Internship requests do not contain GPA criteria."
      />

      <SectionCard className="internship-wireframe-card">
        <div className="internship-section-heading">
          <h2>Registered Companies</h2>
        </div>
        <div className="internship-company-toolbar">
          <SearchInput
            aria-label="Search companies and HR contacts"
            maxLength={120}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search companies or HR contacts"
            value={searchInput}
          />
          <label className="internship-toolbar-field">
            <span>Status</span>
            <SelectField
              aria-label="Filter companies by status"
              onChange={(event) => {
                const value = event.target.value
                updateState({
                  active: value === 'all' ? undefined : value === 'active',
                  selectedCompanyId: undefined,
                })
              }}
              value={state.active === undefined ? 'all' : state.active ? 'active' : 'inactive'}
            >
              <option value="active">Active companies</option>
              <option value="inactive">Inactive companies</option>
              <option value="all">All companies</option>
            </SelectField>
          </label>
          <label className="internship-toolbar-field">
            <span>Sort companies</span>
            <SortSelect
              onChange={(event) => updateState({ sort: event.target.value as typeof state.sort })}
              value={state.sort}
            >
              <option value="name,asc">Name A–Z</option>
              <option value="name,desc">Name Z–A</option>
              <option value="updatedAt,desc">Recently updated</option>
            </SortSelect>
          </label>
          {hasCompanyFilters ? (
            <Button onClick={clearCompanyFilters} variant="secondary">
              Clear Filters
            </Button>
          ) : null}
          <Button
            icon={<span className="material-symbols-outlined">add_business</span>}
            onClick={() => setOverlay('create')}
          >
            Create Company
          </Button>
        </div>

        <LoadingBoundary
          isLoading={companies.isPending}
          label="Loading registered companies"
          skeleton={
            <InternshipManagementListSkeleton
              rows={Math.min(state.size, 5)}
              showPagination
              variant="companies"
            />
          }
        >
          {companies.error ? (
            <ErrorState
              message={mapApiError(companies.error, 'protected').message}
              onAction={() => void companies.refetch()}
              title="Companies unavailable"
            />
          ) : companies.data?.items.length ? (
            <>
              <CompanyTable
                companies={companies.data.items}
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
              <PaginationBar
                label="Company list pagination"
                onPageChange={(page) => updateState({ page })}
                page={companies.data.page.page}
                size={companies.data.page.size}
                totalElements={companies.data.page.totalElements}
                totalPages={companies.data.page.totalPages}
              />
            </>
          ) : (
            <EmptyState
              action={
                hasCompanyFilters ? (
                  <Button onClick={clearCompanyFilters} variant="secondary">
                    Clear Filters
                  </Button>
                ) : undefined
              }
              message={emptyCompanyMessage}
              title={hasCompanyFilters ? 'No matching companies' : 'No companies yet'}
            />
          )}
        </LoadingBoundary>
      </SectionCard>

      <InternshipRequestWorkspace
        onRetrySelectedCompany={() => void selected.refetch()}
        selectedCompany={selected.data}
        selectedCompanyError={selected.error}
        selectedCompanyId={state.selectedCompanyId}
      />

      {overlay === 'create' ? (
        <CompanyForm mode="create" onCancel={close} onSubmit={createCompany} />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={close} title="Company Details">
          <InternshipManagementDetailsSkeleton variant="company" />
        </Modal>
      ) : null}
      {overlay && overlay !== 'create' && selected.error ? (
        <Modal onClose={close} title="Company Details">
          <ErrorState
            message={mapApiError(selected.error, 'protected').message}
            onAction={() => void selected.refetch()}
            title="Company details unavailable"
          />
        </Modal>
      ) : null}
      {overlay === 'details' && selected.data ? (
        <CompanyDetailsModal
          company={selected.data}
          onClose={close}
          onDelete={() => setOverlay('delete')}
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
        <CompanyDeleteDialog
          companyName={selected.data.name}
          error={deleteError}
          isPending={deleteMutation.isPending}
          onClose={close}
          onConfirm={() => void deleteCompany()}
        />
      ) : null}
    </div>
  )
}
