import { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Modal } from '../../../shared/components/overlays/Modal'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { clampPage } from '../../../shared/utils/clampPage'
import { CompanyDeactivateDialog } from '../components/CompanyDeactivateDialog'
import { CompanyDetailsModal } from '../components/CompanyDetailsModal'
import { CompanyForm, mapCompanyToForm } from '../components/CompanyForm'
import { CompanyTable } from '../components/CompanyTable'
import { InternshipRequestWorkspace } from '../components/InternshipRequestWorkspace'
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

type CompanyOverlay = 'create' | 'details' | 'edit' | 'deactivate' | null

const sortOptions = [
  { value: 'name,asc', label: 'Company name · A–Z' },
  { value: 'name,desc', label: 'Company name · Z–A' },
  { value: 'updatedAt,desc', label: 'Recently updated' },
] as const

export function InternshipManagementPage() {
  const { notify } = useNotifications()
  const { searchInput, setSearchInput, state, updateState } = useCompaniesUrlState()
  const [overlay, setOverlay] = useState<CompanyOverlay>(() =>
    state.selectedCompanyId ? 'details' : null,
  )
  const [deactivationError, setDeactivationError] = useState<string>()
  const companies = useCompanies(state)
  const selected = useCompany(state.selectedCompanyId ?? null)
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deactivateMutation = useDeactivateCompany()

  useEffect(() => {
    if (state.selectedCompanyId && !overlay) setOverlay('details')
    if (!state.selectedCompanyId && overlay && overlay !== 'create') setOverlay(null)
  }, [overlay, state.selectedCompanyId])

  useEffect(() => {
    if (!companies.data) return
    const page = clampPage(state.page, companies.data.page.totalElements, state.size)
    if (page !== state.page) updateState({ page })
  }, [companies.data, state.page, state.size, updateState])

  const hasFilters = Boolean(state.search || state.active !== undefined)
  const mappedListError = companies.error ? mapApiError(companies.error, 'protected') : null
  const selectedFormValues = useMemo(
    () => (selected.data ? mapCompanyToForm(selected.data) : undefined),
    [selected.data],
  )

  const closeSelected = () => {
    setOverlay(null)
    setDeactivationError(undefined)
    updateState({ selectedCompanyId: undefined })
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
    notify({
      tone: 'success',
      title: 'Company added',
      message: `${created.name} is ready for internship requests.`,
    })
    updateState({ selectedCompanyId: created.companyId })
    setOverlay('details')
  }

  const updateCompany = async (values: CompanyFormSubmission) => {
    const current = selected.data
    if (!current) throw new TypeError('Load the company before updating it.')
    try {
      const body = {
        name: values.name,
        websiteUrl: values.websiteUrl,
        contactPerson: values.contactPerson,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        notes: values.notes,
        ...(values.active !== current.active ? { active: values.active } : {}),
      }
      const saved = await updateMutation.mutateAsync({
        companyId: current.companyId,
        version: current.version,
        body,
      })
      notify({
        tone: 'success',
        title: saved.active && !current.active ? 'Company reactivated' : 'Company updated',
        message: `${saved.name} was saved.`,
      })
      setOverlay('details')
    } catch (reason) {
      const status = mapApiError(reason, 'protected').status
      if (status === 404) {
        closeSelected()
        await companies.refetch()
      } else if (status === 412 || status === 428) {
        await Promise.all([selected.refetch(), companies.refetch()])
      }
      throw reason
    }
  }

  const deactivateCompany = async () => {
    const current = selected.data
    if (!current) return
    setDeactivationError(undefined)
    try {
      await deactivateMutation.mutateAsync({
        companyId: current.companyId,
        version: current.version,
      })
      notify({
        tone: 'success',
        title: 'Company deactivated',
        message: `${current.name} is no longer available for new internship requests.`,
      })
      closeSelected()
    } catch (reason) {
      const status = mapApiError(reason, 'protected').status
      setDeactivationError(getCompanyMutationErrorMessage(reason))
      if (status === 412 || status === 428)
        await Promise.all([selected.refetch(), companies.refetch()])
      if (status === 404) {
        closeSelected()
        await companies.refetch()
      }
    }
  }

  return (
    <main className="content-stack internship-management-page">
      <PageHeader
        actions={<Button onClick={() => setOverlay('create')}>Add company</Button>}
        description="Maintain company metadata and deterministic internship request requirements."
        eyebrow="Administration"
        title="Internship Management"
      />

      <SectionCard aria-labelledby="company-directory-title" className="company-workspace">
        <div className="company-workspace-heading">
          <div>
            <h2 id="company-directory-title">Companies</h2>
            <p>Manage the organizations available to internship requests.</p>
          </div>
          <Chip>{companies.data?.page.totalElements ?? 0} companies</Chip>
        </div>
        <div className="company-toolbar">
          <label>
            <span>Search companies</span>
            <SearchInput
              aria-label="Search companies"
              maxLength={120}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Company or contact details"
              value={searchInput}
            />
          </label>
          <label>
            <span>Company status</span>
            <SelectField
              aria-label="Company status"
              onChange={(event) =>
                updateState({
                  active:
                    event.target.value === 'active'
                      ? true
                      : event.target.value === 'inactive'
                        ? false
                        : undefined,
                })
              }
              value={state.active === true ? 'active' : state.active === false ? 'inactive' : 'all'}
            >
              <option value="all">All companies</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
          </label>
          <label>
            <span>Sort companies</span>
            <SortSelect
              onChange={(event) => updateState({ sort: event.target.value as typeof state.sort })}
              value={state.sort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SortSelect>
          </label>
        </div>
        <p aria-live="polite" className="company-updating">
          {companies.isFetching && !companies.isPending ? 'Updating companies…' : ''}
        </p>

        <LoadingBoundary
          isLoading={companies.isPending}
          label="Loading company directory"
          minHeight={480}
          skeleton={<SkeletonBlock height={360} lines={0} variant="card" />}
        >
          {mappedListError ? (
            <ErrorState
              correlationId={mappedListError.correlationId}
              message={mappedListError.message}
              onAction={() => void companies.refetch()}
              title="Companies unavailable"
            />
          ) : companies.data?.items.length ? (
            <>
              <CompanyTable
                companies={companies.data.items}
                onSelect={(companyId) => {
                  updateState({ selectedCompanyId: companyId })
                  setOverlay('details')
                }}
              />
              <PaginationBar
                label="Company pages"
                onPageChange={(page) => updateState({ page })}
                onPageSizeChange={(size) => updateState({ size: size as 20 | 50 | 100 })}
                page={companies.data.page.page}
                pageSizeOptions={[20, 50, 100]}
                size={companies.data.page.size}
                totalElements={companies.data.page.totalElements}
                totalPages={companies.data.page.totalPages}
              />
            </>
          ) : (
            <EmptyState
              action={
                hasFilters ? (
                  <Button
                    onClick={() => {
                      setSearchInput('')
                      updateState({ search: '', active: undefined })
                    }}
                    variant="secondary"
                  >
                    Clear search and filters
                  </Button>
                ) : (
                  <Button onClick={() => setOverlay('create')}>Add first company</Button>
                )
              }
              message={
                hasFilters
                  ? 'No companies match the current search and status filter.'
                  : 'Add approved company metadata before creating internship requests.'
              }
              title={hasFilters ? 'No matching companies' : 'No companies yet'}
            />
          )}
        </LoadingBoundary>
      </SectionCard>

      <InternshipRequestWorkspace />

      {overlay === 'create' ? (
        <CompanyForm mode="create" onCancel={() => setOverlay(null)} onSubmit={createCompany} />
      ) : null}
      {overlay && overlay !== 'create' && selected.isPending ? (
        <Modal onClose={closeSelected} title="Company details">
          <SkeletonBlock height={300} lines={0} variant="card" />
        </Modal>
      ) : null}
      {overlay && overlay !== 'create' && selected.error ? (
        <Modal onClose={closeSelected} title="Company unavailable">
          <ErrorState
            message={mapApiError(selected.error, 'protected').message}
            onAction={() => void selected.refetch()}
            title="Unable to load company details"
          />
        </Modal>
      ) : null}
      {overlay === 'details' && selected.data ? (
        <CompanyDetailsModal
          company={selected.data}
          onClose={closeSelected}
          onDeactivate={() => {
            setDeactivationError(undefined)
            setOverlay('deactivate')
          }}
          onEdit={() => setOverlay('edit')}
        />
      ) : null}
      {overlay === 'edit' && selected.data && selectedFormValues ? (
        <CompanyForm
          initialValues={selectedFormValues}
          mode="edit"
          onCancel={() => setOverlay('details')}
          onSubmit={updateCompany}
        />
      ) : null}
      {overlay === 'deactivate' && selected.data ? (
        <CompanyDeactivateDialog
          company={selected.data}
          error={deactivationError}
          isPending={deactivateMutation.isPending}
          onClose={() => setOverlay('details')}
          onConfirm={() => void deactivateCompany()}
        />
      ) : null}
    </main>
  )
}
