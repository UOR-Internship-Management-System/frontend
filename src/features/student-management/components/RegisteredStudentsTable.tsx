import { useId } from 'react'
import { Link } from 'react-router-dom'
import { buildAdminStudentDetailPath } from '../../../app/config/routePaths'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { StatusBadgeTone } from '../../../shared/components/ui/StatusBadge'
import type { RegisteredStudentsQuery } from '../types/studentManagementTypes'
import type { RegisteredStudentView } from '../types/studentManagementTypes'

// GPA thresholds: >=3.7 excellent, >=3.0 good, >=2.0 fair, <2.0 low
function getGpaTone(gpa: number | null): StatusBadgeTone {
  if (gpa === null) return 'neutral'
  if (gpa >= 3.7) return 'success'
  if (gpa >= 3.0) return 'info'
  if (gpa >= 2.0) return 'warning'
  return 'danger'
}

function parseSortColumn(sort: RegisteredStudentsQuery['sort']): {
  col: string
  dir: 'asc' | 'desc'
} {
  const [col, dir] = sort.split(',')
  return { col, dir: dir as 'asc' | 'desc' }
}

function ariaSort(
  currentSort: RegisteredStudentsQuery['sort'],
  colKey: string,
): React.AriaAttributes['aria-sort'] {
  const { col, dir } = parseSortColumn(currentSort)
  if (col !== colKey) return 'none'
  return dir === 'asc' ? 'ascending' : 'descending'
}

type SortIconProps = { col: string; currentSort: RegisteredStudentsQuery['sort'] }

function SortIcon({ col, currentSort }: SortIconProps) {
  const { col: activeCol, dir } = parseSortColumn(currentSort)
  const isActive = activeCol === col
  if (!isActive) {
    return (
      <span
        className="material-symbols-outlined rst-sort-icon rst-sort-icon--inactive"
        aria-hidden="true"
      >
        unfold_more
      </span>
    )
  }
  return (
    <span
      className="material-symbols-outlined rst-sort-icon rst-sort-icon--active"
      aria-hidden="true"
    >
      {dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
    </span>
  )
}

export type RegisteredStudentsTableProps = {
  students: RegisteredStudentView[]
  query: RegisteredStudentsQuery
  selectedIds: Set<string>
  onQueryChange: (patch: Partial<RegisteredStudentsQuery>) => void
  onSelectionChange: (ids: Set<string>) => void
}

export function RegisteredStudentsTable({
  students,
  query,
  selectedIds,
  onQueryChange,
  onSelectionChange,
}: RegisteredStudentsTableProps) {
  const selectAllId = useId()
  const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s.studentId))
  const someSelected = students.some((s) => selectedIds.has(s.studentId)) && !allSelected

  function handleSort(colKey: string) {
    const { col, dir } = parseSortColumn(query.sort)
    if (col === colKey) {
      // toggle direction
      const newDir = dir === 'asc' ? 'desc' : 'asc'
      onQueryChange({ sort: `${colKey},${newDir}` as RegisteredStudentsQuery['sort'], page: 0 })
    } else {
      onQueryChange({ sort: `${colKey},asc` as RegisteredStudentsQuery['sort'], page: 0 })
    }
  }

  function handleSelectAll() {
    if (allSelected) {
      const next = new Set(selectedIds)
      students.forEach((s) => next.delete(s.studentId))
      onSelectionChange(next)
    } else {
      const next = new Set(selectedIds)
      students.forEach((s) => next.add(s.studentId))
      onSelectionChange(next)
    }
  }

  function handleRowSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <div className="rst-table-wrapper" role="region" aria-label="Registered student roster">
      <table className="rst-table">
        <caption className="visually-hidden">
          Registered student roster — {students.length} students shown
        </caption>
        <thead>
          <tr className="rst-table__header-row">
            {/* Select all */}
            <th scope="col" className="rst-col-select">
              <label className="rst-checkbox-label" htmlFor={selectAllId}>
                <span className="visually-hidden">Select all students on this page</span>
              </label>
              <input
                checked={allSelected}
                className="rst-checkbox"
                id={selectAllId}
                onChange={handleSelectAll}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                type="checkbox"
              />
            </th>

            {/* Sortable columns */}
            <th
              scope="col"
              className="rst-col-index"
              aria-sort={ariaSort(query.sort, 'indexNumber')}
            >
              <button
                className="rst-sort-btn"
                onClick={() => handleSort('indexNumber')}
                type="button"
              >
                Index No.
                <SortIcon col="indexNumber" currentSort={query.sort} />
              </button>
            </th>

            <th scope="col" className="rst-col-name" aria-sort={ariaSort(query.sort, 'fullName')}>
              <button className="rst-sort-btn" onClick={() => handleSort('fullName')} type="button">
                Full Name
                <SortIcon col="fullName" currentSort={query.sort} />
              </button>
            </th>

            <th scope="col" className="rst-col-degree">
              Degree Program
            </th>

            <th scope="col" className="rst-col-level">
              Level
            </th>

            <th scope="col" className="rst-col-gpa" aria-sort={ariaSort(query.sort, 'officialGpa')}>
              <button
                className="rst-sort-btn"
                onClick={() => handleSort('officialGpa')}
                type="button"
              >
                GPA
                <SortIcon col="officialGpa" currentSort={query.sort} />
              </button>
            </th>

            <th scope="col" className="rst-col-action">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => {
            const isSelected = selectedIds.has(student.studentId)
            return (
              <tr
                className={`rst-table__row${isSelected ? ' rst-table__row--selected' : ''}`}
                key={student.studentId}
              >
                {/* Row select */}
                <td className="rst-col-select">
                  <label className="rst-checkbox-label">
                    <span className="visually-hidden">Select {student.fullName}</span>
                    <input
                      checked={isSelected}
                      className="rst-checkbox"
                      onChange={() => handleRowSelect(student.studentId)}
                      type="checkbox"
                    />
                  </label>
                </td>

                <td className="rst-col-index" data-label="Index No.">
                  <span className="rst-index-badge">{student.indexNumber}</span>
                </td>

                <td className="rst-col-name" data-label="Full Name">
                  <span className="rst-student-name">{student.fullName}</span>
                  <span className="rst-student-email">{student.universityEmail}</span>
                </td>

                <td className="rst-col-degree" data-label="Degree Program">
                  {student.degreeProgram}
                </td>

                <td className="rst-col-level" data-label="Level">
                  <Chip
                    className={`rst-level-chip rst-level-chip--l${student.currentLevel}`}
                    leadingIcon={
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 14 }}
                        aria-hidden="true"
                      >
                        school
                      </span>
                    }
                    selected={false}
                    variant="filter"
                  >
                    Level {student.currentLevel}
                  </Chip>
                </td>

                <td className="rst-col-gpa" data-label="GPA">
                  <StatusBadge tone={getGpaTone(student.officialGpa)}>
                    {student.officialGpaLabel}
                  </StatusBadge>
                </td>

                <td className="rst-col-action">
                  <Link
                    className="button m3-button m3-button--outlined m3-button--size-sm"
                    to={buildAdminStudentDetailPath(student.studentId)}
                  >
                    <span className="button-content">View</span>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
