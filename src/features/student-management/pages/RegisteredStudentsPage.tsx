import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { Snackbar } from '../../../shared/components/feedback/Snackbar'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button } from '../../../shared/components/ui/Button'
import {
  SkeletonPagination,
  SkeletonStatusRegion,
  SkeletonTableGrid,
  SkeletonToolbar,
} from '../../../shared/skeletons'
import { RegisteredStudentsCardList } from '../components/RegisteredStudentsCardList'
import { RegisteredStudentsTable } from '../components/RegisteredStudentsTable'
import type { RspViewMode } from '../components/RegisteredStudentsToolbar'
import { RegisteredStudentsToolbar } from '../components/RegisteredStudentsToolbar'
import { StudentExportDialog } from '../components/StudentExportDialog'
import { useRegisteredStudents } from '../hooks/useRegisteredStudents'
import { useRegisteredStudentsUrlState } from '../hooks/useRegisteredStudentsUrlState'

const PAGE_TITLE = 'Registered Students | CV Management & Filtering System'

export function RegisteredStudentsPage() {
  const { query, searchInput, setSearchInput, updateQuery } = useRegisteredStudentsUrlState()
  const studentsQuery = useRegisteredStudents(query)

  // UI state
  const [viewMode, setViewMode] = useState<RspViewMode>('table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportSnackbar, setExportSnackbar] = useState<'success' | 'error' | null>(null)

  // Page title
  useEffect(() => {
    const prev = document.title
    document.title = PAGE_TITLE
    return () => { document.title = prev }
  }, [])

  // Guard: if current page is beyond totalPages (after filter), reset
  useEffect(() => {
    const totalPages = studentsQuery.data?.page.totalPages ?? 0
    if (totalPages > 0 && query.page >= totalPages) updateQuery({ page: totalPages - 1 })
  }, [query.page, studentsQuery.data?.page.totalPages, updateQuery])

  // Clear selection when students change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [studentsQuery.data])

  // Dismiss snackbar after 4 s
  useEffect(() => {
    if (!exportSnackbar) return
    const t = setTimeout(() => setExportSnackbar(null), 4000)
    return () => clearTimeout(t)
  }, [exportSnackbar])

  const mappedError = studentsQuery.isError ? mapApiError(studentsQuery.error, 'protected') : null
  const hasFilters = Boolean(query.search || query.level)
  const items = studentsQuery.data?.items ?? []
  const hasStudents = items.length > 0
  const totalElements = studentsQuery.data?.page.totalElements ?? 0

  return (
    <div className="rsp-page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <PageHeader
        title="Registered Students"
        description="Centralized master directory for registered Level 3 and Level 4 students. Search, filter, sort, and inspect student records."
        actions={
          <Button
            disabled={items.length === 0}
            icon={<span className="material-symbols-outlined" aria-hidden="true">download</span>}
            onClick={() => setIsExportDialogOpen(true)}
            variant="tonal"
          >
            Export
          </Button>
        }
      />

      {/* ── Toolbar ────────────────────────────────────────── */}
      <section className="rsp-content-card" aria-label="Student roster">
        <LoadingBoundary
          isLoading={studentsQuery.isPending}
          label="Loading registered Students"
          minHeight={520}
          skeleton={
            <SkeletonStatusRegion label="Loading registered Students">
              <SkeletonToolbar fields={3} />
              <SkeletonTableGrid
                columns={6}
                gridTemplateColumns="repeat(6, minmax(100px, 1fr))"
                rows={5}
              />
              <SkeletonPagination />
            </SkeletonStatusRegion>
          }
        >
          {mappedError ? (
            <ErrorState
              correlationId={mappedError.correlationId}
              message={mappedError.message}
              onAction={() => void studentsQuery.refetch()}
              title="Unable to load registered Students"
            />
          ) : studentsQuery.data ? (
            <>
              {/* Toolbar */}
              <RegisteredStudentsToolbar
                isFetching={studentsQuery.isFetching}
                onQueryChange={updateQuery}
                onSearchChange={setSearchInput}
                onViewModeChange={setViewMode}
                query={query}
                searchInput={searchInput}
                totalElements={totalElements}
                viewMode={viewMode}
              />

              {/* Selection action bar */}
              {selectedIds.size > 0 && (
                <div className="rsp-selection-bar" role="status" aria-live="polite">
                  <span className="material-symbols-outlined" aria-hidden="true">check_box</span>
                  <span>
                    <strong>{selectedIds.size}</strong>{' '}
                    {selectedIds.size === 1 ? 'student' : 'students'} selected
                  </span>
                  <Button
                    icon={
                      <span className="material-symbols-outlined" aria-hidden="true">download</span>
                    }
                    onClick={() => setIsExportDialogOpen(true)}
                    size="sm"
                    variant="tonal"
                  >
                    Export selected
                  </Button>
                  <Button
                    onClick={() => setSelectedIds(new Set())}
                    size="sm"
                    variant="text"
                  >
                    Deselect all
                  </Button>
                </div>
              )}

              {/* Data: Table or Card list */}
              {hasStudents ? (
                <div className={`rsp-data-container ${viewMode === 'cards' ? 'rsp-mode-cards' : 'rsp-mode-table'}`}>
                  <RegisteredStudentsTable
                    onQueryChange={updateQuery}
                    onSelectionChange={setSelectedIds}
                    query={query}
                    selectedIds={selectedIds}
                    students={items}
                  />
                  <RegisteredStudentsCardList students={items} />
                </div>
              ) : null}

              {/* Empty states */}
              {!hasStudents && hasFilters ? (
                <EmptyState
                  action={
                    <Button
                      onClick={() => {
                        setSearchInput('')
                        updateQuery({ search: '', level: undefined })
                      }}
                      variant="secondary"
                    >
                      Clear search and filters
                    </Button>
                  }
                  message="No registered Students match the current search or level filter."
                  title="No matching Students"
                />
              ) : null}
              {!hasStudents && !hasFilters ? (
                <EmptyState
                  message="No registered Students are currently available."
                  title="Student directory is empty"
                />
              ) : null}

              {/* Pagination */}
              <div className="rsp-pagination-wrapper">
                <PaginationBar
                  label="Registered Student pages"
                  onPageChange={(page) => updateQuery({ page })}
                  onPageSizeChange={(size) => updateQuery({ size: size as 5 | 20 | 50 | 100 })}
                  page={studentsQuery.data.page.page}
                  pageSizeOptions={[5, 20, 50, 100]}
                  size={studentsQuery.data.page.size}
                  totalElements={studentsQuery.data.page.totalElements}
                  totalPages={studentsQuery.data.page.totalPages}
                />
              </div>
            </>
          ) : null}
        </LoadingBoundary>
      </section>

      {/* ── Export dialog ─────────────────────────────────── */}
      <StudentExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExportDone={() => setExportSnackbar('success')}
        selectedIds={selectedIds.size > 0 ? selectedIds : undefined}
        students={items}
      />

      {/* ── Snackbar ──────────────────────────────────────── */}
      {exportSnackbar === 'success' && (
        <div className="rsp-snackbar-anchor" aria-live="polite">
          <Snackbar
            leadingIcon={
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
            }
            message="Student roster exported successfully."
            onClose={() => setExportSnackbar(null)}
            tone="success"
          />
        </div>
      )}
    </div>
  )
}
