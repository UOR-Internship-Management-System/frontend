import { useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { EligibleStudentForm } from '../components/EligibleStudentForm'
import { EligibleStudentImportPanel } from '../components/EligibleStudentImportPanel'
import { EligibleStudentsTable } from '../components/EligibleStudentsTable'
import { useEligibleStudentMutations, useEligibleStudents } from '../hooks/useEligibleStudents'
import { ELIGIBLE_STUDENTS_PAGE_SIZE } from '../types/eligibleStudentTypes'
import type { EligibleStudent, EligibleStudentRequest } from '../types/eligibleStudentTypes'

export function EligibleStudentsPage() {
  const { notify } = useNotifications()
  const [search, setSearchValue] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search, 300)
  const [editing, setEditing] = useState<EligibleStudent | 'new' | null>(null)
  const [deleting, setDeleting] = useState<EligibleStudent | null>(null)

  const setSearch = (value: string) => {
    setSearchValue(value)
    setPage(0)
  }

  const query = useEligibleStudents({
    page,
    size: ELIGIBLE_STUDENTS_PAGE_SIZE,
    sort: 'indexNumber,asc',
    search: debouncedSearch,
  })
  const mutations = useEligibleStudentMutations()
  const pending = mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending

  const save = async (values: EligibleStudentRequest) => {
    const item =
      editing === 'new'
        ? await mutations.create.mutateAsync(values)
        : await mutations.update.mutateAsync({ id: editing!.id, values })
    notify({
      tone: 'success',
      title: editing === 'new' ? 'Eligible student added' : 'Eligible student updated',
      message: `${item.fullName} was saved.`,
    })
    setEditing(null)
  }

  const remove = async () => {
    if (!deleting) return
    try {
      await mutations.remove.mutateAsync(deleting.id)
      notify({
        tone: 'success',
        title: 'Eligible student removed',
        message: `${deleting.fullName} was removed from the roster.`,
      })
      setDeleting(null)
    } catch (error) {
      const mapped = mapApiError(error, 'protected')
      notify({ tone: 'error', title: 'Unable to remove eligible student', message: mapped.message })
    }
  }

  const items = query.data?.items ?? []
  const mappedError = query.isError ? mapApiError(query.error, 'protected') : null

  return (
    <article className="content-stack eligible-students-page">
      <PageHeader
        description="Control who can register — add students individually or bulk import via Excel/CSV. Typically done once per academic year."
        eyebrow="Admin workspace"
        title="Eligible Students"
      />

      <EligibleStudentImportPanel />

      <SectionCard className="eligible-students-list-card">
        <div className="internship-section-heading">
          <h2>Roster</h2>
          <Button
            icon={<span className="material-symbols-outlined">person_add</span>}
            onClick={() => setEditing('new')}
          >
            Add Student
          </Button>
        </div>
        <SearchInput
          aria-label="Search eligible students"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by index number, name, or email"
          value={search}
        />
        <LoadingBoundary isLoading={query.isPending} label="Loading eligible students">
          {mappedError ? (
            <ErrorState
              correlationId={mappedError.correlationId}
              message={mappedError.message}
              onAction={() => void query.refetch()}
              title="Eligible students unavailable"
            />
          ) : items.length === 0 ? (
            <EmptyState
              message={
                search
                  ? `No eligible students match "${search}".`
                  : 'No eligible students have been added yet.'
              }
              title={search ? 'No matching students' : 'Nothing added yet'}
            />
          ) : (
            <>
              <EligibleStudentsTable
                disabled={pending}
                items={items}
                onDelete={setDeleting}
                onEdit={setEditing}
              />
              {query.data ? (
                <PaginationBar
                  label="Eligible students pagination"
                  onPageChange={setPage}
                  page={query.data.page.page}
                  size={query.data.page.size}
                  totalElements={query.data.page.totalElements}
                  totalPages={query.data.page.totalPages}
                />
              ) : null}
            </>
          )}
        </LoadingBoundary>
      </SectionCard>

      {editing ? (
        <EligibleStudentForm
          item={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={save}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          closeDisabled={mutations.remove.isPending}
          onClose={() => setDeleting(null)}
          title="Remove Eligible Student"
        >
          <p>
            Remove <strong>{deleting.fullName}</strong> ({deleting.indexNumber}) from the roster?
            They won&rsquo;t be able to register.
          </p>
          <div className="modal-actions">
            <Button
              disabled={mutations.remove.isPending}
              onClick={() => setDeleting(null)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button isLoading={mutations.remove.isPending} onClick={() => void remove()}>
              Remove Student
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </article>
  )
}
