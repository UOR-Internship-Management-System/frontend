import type {
  ApiAcademicLedgerStagedRowResponse,
  ApiAcademicLedgerValidationResultResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { LedgerStagedRowsQuery } from '../types/academicLedgerTypes'

function rowTone(status: ApiAcademicLedgerStagedRowResponse['validationStatus']) {
  return status === 'INVALID' ? 'danger' : status === 'VALID' ? 'success' : 'neutral'
}

export function LedgerValidationTable({
  isFetching,
  onQueryChange,
  onSearchChange,
  page,
  query,
  rows,
  searchInput,
  validation,
}: {
  rows: ApiAcademicLedgerStagedRowResponse[]
  validation: ApiAcademicLedgerValidationResultResponse
  query: LedgerStagedRowsQuery
  searchInput: string
  isFetching: boolean
  page: { page: number; size: number; totalElements: number; totalPages: number }
  onSearchChange: (value: string) => void
  onQueryChange: (patch: Partial<LedgerStagedRowsQuery>) => void
}) {
  return (
    <section
      aria-labelledby="staged-ledger-rows-title"
      className="section-card ledger-review-panel"
    >
      <div className="ledger-section-heading">
        <div>
          <p className="section-kicker">Pre-commit review</p>
          <h2 id="staged-ledger-rows-title">Staged rows and validation</h2>
          <p>
            {validation.totalRows} rows checked · {validation.validRows} valid ·{' '}
            {validation.invalidRows} invalid
          </p>
        </div>
        {isFetching ? <span role="status">Updating…</span> : null}
      </div>
      {validation.errors.length ? (
        <div className="ledger-validation-summary" role="alert">
          <strong>Validation issues require attention</strong>
          <ul>
            {validation.errors.slice(0, 8).map((error, index) => (
              <li key={`${error.rowNumber}-${error.code}-${index}`}>
                Row {error.rowNumber}
                {error.field ? ` · ${error.field}` : ''}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="ledger-validation-success" role="status">
          All server validation checks passed.
        </p>
      )}
      <div className="ledger-toolbar">
        <label>
          Search staged rows
          <input
            aria-label="Search staged rows"
            className="input"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Index number or course code"
            value={searchInput}
          />
        </label>
        <label>
          Validation status
          <select
            className="select"
            value={query.validationStatus ?? ''}
            onChange={(event) =>
              onQueryChange({
                validationStatus: (event.target.value ||
                  undefined) as typeof query.validationStatus,
              })
            }
          >
            <option value="">All rows</option>
            <option value="VALID">Valid</option>
            <option value="WARNING">Warnings</option>
            <option value="INVALID">Invalid</option>
          </select>
        </label>
        <label>
          Sort rows
          <select
            className="select"
            value={query.sort}
            onChange={(event) =>
              onQueryChange({ sort: event.target.value as LedgerStagedRowsQuery['sort'] })
            }
          >
            <option value="rowNumber,asc">Row number ↑</option>
            <option value="rowNumber,desc">Row number ↓</option>
            <option value="studentIndexNumber,asc">Student index</option>
            <option value="courseCode,asc">Course code</option>
            <option value="validationStatus,asc">Validation status</option>
          </select>
        </label>
      </div>
      {rows.length ? (
        <div className="table-responsive ledger-table-wrap">
          <table className="ledger-table staged-ledger-table">
            <caption>Staged academic ledger rows</caption>
            <thead>
              <tr>
                <th scope="col">Row</th>
                <th scope="col">Student</th>
                <th scope="col">Course</th>
                <th scope="col">Period</th>
                <th scope="col">Grade</th>
                <th scope="col">Status</th>
                <th scope="col">Diagnostics</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.stagingRowId}>
                  <td data-label="Row">{row.rowNumber}</td>
                  <td data-label="Student">
                    <strong>{row.studentIndexNumber}</strong>
                    {!row.studentId ? (
                      <span className="ledger-secondary">Unmatched Student</span>
                    ) : null}
                  </td>
                  <td data-label="Course">
                    <strong>{row.courseCode}</strong>
                    <span className="ledger-secondary">
                      {row.courseTitle ?? 'Title unavailable'}
                    </span>
                  </td>
                  <td data-label="Period">
                    {row.academicYear}
                    <span className="ledger-secondary">{row.semester}</span>
                  </td>
                  <td data-label="Grade">
                    {row.letterGrade}
                    <span className="ledger-secondary">
                      {row.gradePoint === null
                        ? 'No grade point'
                        : `${row.gradePoint.toFixed(2)} points`}
                    </span>
                  </td>
                  <td data-label="Status">
                    <StatusBadge tone={rowTone(row.validationStatus)}>
                      {row.validationStatus}
                    </StatusBadge>
                  </td>
                  <td data-label="Diagnostics">
                    {row.validationErrors.length ? (
                      <ul className="ledger-row-errors">
                        {row.validationErrors.map((error, index) => (
                          <li key={`${error.code}-${index}`}>{error.message}</li>
                        ))}
                      </ul>
                    ) : (
                      'None'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No staged rows"
          message="No staged rows match the current search and validation filter."
        />
      )}
      <PaginationBar
        label="Staged academic ledger row pages"
        page={page.page}
        size={page.size}
        totalElements={page.totalElements}
        totalPages={page.totalPages}
        pageSizeOptions={[20, 50, 100]}
        onPageChange={(nextPage) => onQueryChange({ page: nextPage })}
        onPageSizeChange={(size) => onQueryChange({ size: size as 20 | 50 | 100 })}
      />
    </section>
  )
}
