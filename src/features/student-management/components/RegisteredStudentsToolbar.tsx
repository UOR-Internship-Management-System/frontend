import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { Chip } from '../../../shared/components/ui/Chip'
import type { RegisteredStudentsQuery } from '../types/studentManagementTypes'

const sortOptions: ReadonlyArray<{ value: RegisteredStudentsQuery['sort']; label: string }> = [
  { value: 'fullName,asc', label: 'Full name · A–Z' },
  { value: 'officialGpa,desc', label: 'Official GPA · highest' },
  { value: 'officialGpa,asc', label: 'Official GPA · lowest' },
  { value: 'indexNumber,asc', label: 'Index number · ascending' },
]

type RegisteredStudentsToolbarProps = {
  query: RegisteredStudentsQuery
  searchInput: string
  totalElements: number
  isFetching: boolean
  onSearchChange: (value: string) => void
  onQueryChange: (patch: Partial<RegisteredStudentsQuery>) => void
}

export function RegisteredStudentsToolbar({
  isFetching,
  onQueryChange,
  onSearchChange,
  query,
  searchInput,
  totalElements,
}: RegisteredStudentsToolbarProps) {
  return (
    <div className="registered-students-toolbar">
      <div className="registered-students-toolbar-heading">
        <div>
          <h2 id="registered-students-roster-title">Student roster</h2>
          <p>Search and review registered Level 3 and Level 4 Students.</p>
        </div>
        <Chip>{totalElements} registered Students</Chip>
      </div>
      <div className="registered-students-controls">
        <label className="registered-students-search">
          <span>Search registered Students</span>
          <SearchInput
            maxLength={120}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name, index, email, or academic batch"
            value={searchInput}
          />
        </label>
        <label>
          <span>Sort roster</span>
          <SortSelect
            onChange={(event) =>
              onQueryChange({ sort: event.target.value as RegisteredStudentsQuery['sort'] })
            }
            value={query.sort}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SortSelect>
        </label>
        <fieldset className="registered-students-levels">
          <legend>Current level</legend>
          {[3, 4].map((level) => {
            const selected = query.level === level
            return (
              <button
                aria-pressed={selected}
                className={`filter-button ${selected ? 'filter-button-selected' : ''}`.trim()}
                key={level}
                onClick={() => onQueryChange({ level: selected ? undefined : (level as 3 | 4) })}
                type="button"
              >
                Level {level}
              </button>
            )
          })}
        </fieldset>
      </div>
      <p aria-live="polite" className="registered-students-updating">
        {isFetching ? 'Updating roster…' : ''}
      </p>
    </div>
  )
}
