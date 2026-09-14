import { useCallback, useId } from 'react'
import { TextField } from '../../../shared/components/forms/TextField'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { SegmentedButton } from '../../../shared/components/ui/SegmentedButton'
import type { RegisteredStudentsQuery } from '../types/studentManagementTypes'

export type RspViewMode = 'table' | 'cards'

const sortOptions: ReadonlyArray<{ value: RegisteredStudentsQuery['sort']; label: string; icon: string }> = [
  { value: 'fullName,asc', label: 'Name A–Z', icon: 'sort_by_alpha' },
  { value: 'officialGpa,desc', label: 'GPA High→Low', icon: 'arrow_downward' },
  { value: 'officialGpa,asc', label: 'GPA Low→High', icon: 'arrow_upward' },
  { value: 'indexNumber,asc', label: 'Index No.', icon: 'tag' },
]

const viewOptions = [
  {
    value: 'table' as const,
    label: 'Table',
    icon: <span className="material-symbols-outlined" style={{ fontSize: 18 }}>table_rows</span>,
  },
  {
    value: 'cards' as const,
    label: 'Cards',
    icon: <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>,
  },
]

type RegisteredStudentsToolbarProps = {
  query: RegisteredStudentsQuery
  searchInput: string
  totalElements: number
  isFetching: boolean
  viewMode: RspViewMode
  onSearchChange: (value: string) => void
  onQueryChange: (patch: Partial<RegisteredStudentsQuery>) => void
  onViewModeChange: (mode: RspViewMode) => void
}

export function RegisteredStudentsToolbar({
  isFetching,
  onQueryChange,
  onSearchChange,
  onViewModeChange,
  query,
  searchInput,
  totalElements,
  viewMode,
}: RegisteredStudentsToolbarProps) {
  const searchId = useId()

  return (
    <div className="rsp-toolbar" role="search" aria-label="Student roster controls">
      {/* Progress strip */}
      <div
        className="rsp-toolbar__progress"
        aria-hidden="true"
        data-fetching={isFetching}
      />

      <TextField
        className="rsp-toolbar-field"
        id={searchId}
        label="Search students"
        aria-label="Search students by index number, name, or academic batch"
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by index number, name, or batch…"
        value={searchInput}
        leadingIcon={
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            search
          </span>
        }
      />

      <M3SelectField
        className="rsp-toolbar-field"
        label="Filter by level"
        aria-label="Filter by level"
        onChange={(value) => onQueryChange({ level: value ? Number(value) as 3 | 4 : undefined, page: 0 })}
        value={query.level ? String(query.level) : ''}
        options={[
          { value: '', label: 'All Levels' },
          { value: '3', label: 'Level 3' },
          { value: '4', label: 'Level 4' },
        ]}
      />

      <M3SelectField
        className="rsp-toolbar-field"
        label="Sort results"
        aria-label="Sort candidate results"
        onChange={(value) =>
          onQueryChange({
            sort: value as RegisteredStudentsQuery['sort'],
            page: 0
          })
        }
        value={query.sort}
        options={sortOptions.map(opt => ({ value: opt.value, label: opt.label }))}
      />

      <div className="rsp-toolbar__view-toggle" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <p className="rsp-toolbar__count" aria-live="polite" aria-atomic="true" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {!isFetching ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
                person
              </span>
              <strong style={{ color: 'var(--color-text)' }}>{totalElements.toLocaleString()}</strong>
            </>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="app-spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
              Updating…
            </span>
          )}
        </p>

        <SegmentedButton
          ariaLabel="View mode"
          onChange={(v) => onViewModeChange(v as RspViewMode)}
          options={viewOptions}
          value={viewMode}
        />
      </div>
    </div>
  )
}
