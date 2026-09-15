import type {
  ApiAcademicLedgerStagedRowResponse,
  ApiAcademicLedgerValidationResultResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { LedgerStagedRowsQuery } from '../types/academicLedgerTypes'

function rowTone(status: ApiAcademicLedgerStagedRowResponse['validationStatus']) {
  return status === 'INVALID' ? 'danger' : status === 'VALID' ? 'success' : 'warning'
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
    <Card aria-labelledby="staged-ledger-rows-title" variant="outlined">
      <CardHeader className="s5-section-heading">
        <div>
          <CardTitle id="staged-ledger-rows-title">Staged rows and validation</CardTitle>
          <p>
            {validation.totalRows} rows checked · {validation.validRows} valid ·{' '}
            {validation.invalidRows} invalid
          </p>
        </div>
        {isFetching ? (
          <span className="al-updating-note" role="status">
            Updating…
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        {validation.errors.length ? (
          <div className="al-validation-summary" role="alert">
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
          <p className="al-validation-success" role="status">
            All server validation checks passed.
          </p>
        )}

        <div className="al-toolbar">
          <SearchBar
            aria-label="Search staged rows"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Index number or course code"
            value={searchInput}
          />
          <M3SelectField
            className="al-field"
            label="Validation status"
            aria-label="Validation status"
            onChange={(value) =>
              onQueryChange({
                validationStatus: (value || undefined) as typeof query.validationStatus,
              })
            }
            value={query.validationStatus ?? ''}
            options={[
              { value: '', label: 'All rows' },
              { value: 'VALID', label: 'Valid' },
              { value: 'WARNING', label: 'Warnings' },
              { value: 'INVALID', label: 'Invalid' },
            ]}
          />
          <M3SelectField
            className="al-field"
            label="Sort rows"
            aria-label="Sort rows"
            onChange={(value) => onQueryChange({ sort: value as LedgerStagedRowsQuery['sort'] })}
            value={query.sort}
            options={[
              { value: 'rowNumber,asc', label: 'Row number ↑' },
              { value: 'rowNumber,desc', label: 'Row number ↓' },
              { value: 'studentIndexNumber,asc', label: 'Student index' },
              { value: 'courseCode,asc', label: 'Course code' },
              { value: 'validationStatus,asc', label: 'Validation status' },
            ]}
          />
        </div>

        {rows.length ? (
          <div className="al-table-wrap" tabIndex={0}>
            <table className="al-table">
              <caption className="visually-hidden">Staged academic ledger rows</caption>
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
                    <td>{row.rowNumber}</td>
                    <td>
                      <strong>{row.studentIndexNumber}</strong>
                      {!row.studentId ? (
                        <span className="al-secondary">Unmatched Student</span>
                      ) : null}
                    </td>
                    <td>
                      <strong>{row.courseCode}</strong>
                      <span className="al-secondary">{row.courseTitle ?? 'Title unavailable'}</span>
                    </td>
                    <td>
                      {row.academicYear}
                      <span className="al-secondary">{row.semester}</span>
                    </td>
                    <td>
                      {row.letterGrade}
                      <span className="al-secondary">
                        {row.gradePoint === null
                          ? 'No grade point'
                          : `${row.gradePoint.toFixed(2)} points`}
                      </span>
                    </td>
                    <td>
                      <StatusBadge tone={rowTone(row.validationStatus)}>
                        {row.validationStatus}
                      </StatusBadge>
                    </td>
                    <td>
                      {row.validationErrors.length ? (
                        <ul className="al-row-errors">
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
            message="No staged rows match the current search and validation filter."
            title="No staged rows"
          />
        )}

        <PaginationBar
          label="Staged academic ledger row pages"
          onPageChange={(nextPage) => onQueryChange({ page: nextPage })}
          onPageSizeChange={(size) => onQueryChange({ size: size as 20 | 50 | 100 })}
          page={page.page}
          pageSizeOptions={[20, 50, 100]}
          size={page.size}
          totalElements={page.totalElements}
          totalPages={page.totalPages}
        />
      </CardContent>
    </Card>
  )
}
