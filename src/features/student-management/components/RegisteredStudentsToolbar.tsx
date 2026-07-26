import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { Chip } from '../../../shared/components/ui/Chip'
import type { RegisteredStudentsQuery } from '../types/studentManagementTypes'

const sortOptions: ReadonlyArray<{ value: RegisteredStudentsQuery['sort']; label: string }> = [
  { value: 'fullName,asc', label: 'Alphabetical order' },
  { value: 'officialGpa,desc', label: 'GPA (High to Low)' },
  { value: 'officialGpa,asc', label: 'GPA (Low to High)' },
  { value: 'indexNumber,asc', label: 'Index Number order' },
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
          <h2 id="registered-students-roster-title">Student Roster</h2>
          <p>Search and inspect registered Level 3 and Level 4 Student records.</p>
        </div>
        <Chip>{totalElements} Registered Undergraduates</Chip>
      </div>
      <div className="registered-students-controls">
        <label className="registered-students-search">
          <span>Search Students</span>
          <SearchInput
            maxLength={120}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search Students by index, name, or batch"
            value={searchInput}
          />
        </label>
        <label>
          <span>Sort Students</span>
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
          <legend>Quick Filters</legend>
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
                Level {level} Candidates Only
              </button>
            )
          })}
        </fieldset>
      </div>
      <p aria-live="polite" className="registered-students-updating">
        {isFetching ? 'Updating Student roster…' : ''}
      </p>
    </div>
  )
}
