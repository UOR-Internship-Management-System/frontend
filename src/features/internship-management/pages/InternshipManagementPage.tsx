import { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { ExtendedFab } from '../../../shared/components/ui/ExtendedFab'
import { CompanyDeleteDialog } from '../components/CompanyDeleteDialog'
import { CompanyDetailsModal } from '../components/CompanyDetailsModal'
import { CompanyForm, mapCompanyToForm } from '../components/CompanyForm'
import { CompanyTable } from '../components/CompanyTable'
import { InternshipRequestWorkspace } from '../components/InternshipRequestWorkspace'
import { SkeletonFormFields, SkeletonListRows, SkeletonPagination } from '../../../shared/skeletons'
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
  })
  const selected = useCompany(state.selectedCompanyId ?? null)
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()
  const formValues = useMemo(
    () => (selected.data ? mapCompanyToForm(selected.data) : undefined),
    [selected.data],
  )
  const hasCompanyFilters = Boolean(state.search || state.sort !== 'name,asc')

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
    updateState({ search: '', sort: 'name,asc', selectedCompanyId: undefined })
  }

  const emptyCompanyMessage = state.search
    ? 'No companies match the current search.'
    : 'Create the first company before adding internship requests.'

  return (
    <div className="im-page">
      <PageHeader
        title="Internship Requests Management"
        description="Manage external company metadata and internship requests used by deterministic candidate filtering. Internship requests do not contain GPA criteria."
      />

      <Card className="im-section" variant="outlined">
        <CardHeader className="im-section-heading">
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent className="im-section-content">
          <div
            className="im-toolbar"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}
          >
            <SearchBar
              aria-label="Search companies and HR contacts"
              maxLength={120}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search companies or HR contacts"
              value={searchInput}
              style={{ flex: '1 1 300px', maxWidth: '400px', minWidth: '200px' }}
            />
            <M3SelectField
              label="Sort companies"
              style={{ width: '220px', flex: '0 0 auto' }}
              onChange={(value) => updateState({ sort: value as typeof state.sort })}
              value={state.sort}
              options={[
                { value: 'name,asc', label: 'Name A–Z' },
                { value: 'name,desc', label: 'Name Z–A' },
                { value: 'updatedAt,desc', label: 'Recently updated' },
              ]}
            />
            {hasCompanyFilters ? (
              <Button onClick={clearCompanyFilters} variant="outlined">
                Clear Filters
              </Button>
            ) : null}
            <ExtendedFab
              aria-label="Add company"
              icon={
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
              }
              label="Add company"
              onClick={() => setOverlay('create')}
            />
          </div>

          <LoadingBoundary
            isLoading={companies.isPending}
            label="Loading registered companies"
            skeleton={
              <>
                <SkeletonListRows count={Math.min(state.size, 5)} />
                <SkeletonPagination />
              </>
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
                    <Button onClick={clearCompanyFilters} variant="outlined">
                      Clear Filters
                    </Button>
                  ) : undefined
                }
                message={emptyCompanyMessage}
                title={hasCompanyFilters ? 'No matching companies' : 'No companies yet'}
              />
            )}
          </LoadingBoundary>
        </CardContent>
      </Card>

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
          <SkeletonFormFields count={6} />
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
