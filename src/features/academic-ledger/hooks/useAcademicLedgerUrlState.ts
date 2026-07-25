import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { readNonnegativeInteger, useUrlQueryState } from '../../../shared/hooks/useUrlQueryState'
import type { RegisteredStudentsQuery } from '../../student-management/types/studentManagementTypes'
import type { LedgerStagedRowsQuery, LedgerUploadsQuery } from '../types/academicLedgerTypes'

export type AcademicLedgerUrlState = {
  uploadId: string | null
  uploads: LedgerUploadsQuery
  rows: LedgerStagedRowsQuery
  students: RegisteredStudentsQuery
}

const sizes = [20, 50, 100] as const
const uploadSorts = [
  'uploadedAt,desc',
  'uploadedAt,asc',
  'originalFilename,asc',
  'status,asc',
  'status,desc',
] as const
const rowSorts = [
  'rowNumber,asc',
  'rowNumber,desc',
  'studentIndexNumber,asc',
  'courseCode,asc',
  'validationStatus,asc',
] as const
const uploadStatuses = [
  'RECEIVED',
  'PROCESSING',
  'STAGED',
  'READY_TO_COMMIT',
  'COMMITTING',
  'COMMITTED',
  'VALIDATION_FAILED',
  'PROCESSING_FAILED',
] as const
const rowStatuses = ['VALID', 'WARNING', 'INVALID'] as const

function allowedValue<T extends string>(value: string | null, values: readonly T[]) {
  return values.includes(value as T) ? (value as T) : undefined
}

function allowedSize(value: string | null) {
  const parsed = readNonnegativeInteger(value, 20)
  return sizes.includes(parsed as 20 | 50 | 100) ? (parsed as 20 | 50 | 100) : 20
}

export function parseAcademicLedgerUrlState(parameters: URLSearchParams): AcademicLedgerUrlState {
  return {
    uploadId: parameters.get('uploadId'),
    uploads: {
      page: readNonnegativeInteger(parameters.get('batchPage'), 0),
      size: allowedSize(parameters.get('batchSize')),
      sort: allowedValue(parameters.get('batchSort'), uploadSorts) ?? 'uploadedAt,desc',
      search: (parameters.get('batchSearch') ?? '').trim().slice(0, 120),
      status: allowedValue(parameters.get('batchStatus'), uploadStatuses),
    },
    rows: {
      page: readNonnegativeInteger(parameters.get('rowPage'), 0),
      size: allowedSize(parameters.get('rowSize')),
      sort: allowedValue(parameters.get('rowSort'), rowSorts) ?? 'rowNumber,asc',
      search: (parameters.get('rowSearch') ?? '').trim().slice(0, 120),
      validationStatus: allowedValue(parameters.get('rowStatus'), rowStatuses),
    },
    students: {
      page: readNonnegativeInteger(parameters.get('studentPage'), 0),
      size: 5,
      sort: 'fullName,asc',
      search: (parameters.get('studentSearch') ?? '').trim().slice(0, 120),
    },
  }
}

export function serializeAcademicLedgerUrlState(state: AcademicLedgerUrlState) {
  const parameters = new URLSearchParams()
  if (state.uploadId) parameters.set('uploadId', state.uploadId)
  if (state.uploads.page) parameters.set('batchPage', String(state.uploads.page))
  if (state.uploads.size !== 20) parameters.set('batchSize', String(state.uploads.size))
  if (state.uploads.sort !== 'uploadedAt,desc') parameters.set('batchSort', state.uploads.sort)
  if (state.uploads.search) parameters.set('batchSearch', state.uploads.search)
  if (state.uploads.status) parameters.set('batchStatus', state.uploads.status)
  if (state.rows.page) parameters.set('rowPage', String(state.rows.page))
  if (state.rows.size !== 20) parameters.set('rowSize', String(state.rows.size))
  if (state.rows.sort !== 'rowNumber,asc') parameters.set('rowSort', state.rows.sort)
  if (state.rows.search) parameters.set('rowSearch', state.rows.search)
  if (state.rows.validationStatus) parameters.set('rowStatus', state.rows.validationStatus)
  if (state.students.page) parameters.set('studentPage', String(state.students.page))
  if (state.students.search) parameters.set('studentSearch', state.students.search)
  return parameters
}

export function useAcademicLedgerUrlState() {
  const [state, setState] = useUrlQueryState({
    parse: parseAcademicLedgerUrlState,
    serialize: serializeAcademicLedgerUrlState,
  })
  const [rowSearchInput, setRowSearchInput] = useState(state.rows.search)
  const [studentSearchInput, setStudentSearchInput] = useState(state.students.search)
  const debouncedRowSearch = useDebouncedValue(rowSearchInput, 300)
  const debouncedStudentSearch = useDebouncedValue(studentSearchInput, 300)

  useEffect(() => setRowSearchInput(state.rows.search), [state.rows.search])
  useEffect(() => setStudentSearchInput(state.students.search), [state.students.search])
  useEffect(() => {
    const search = debouncedRowSearch.trim().slice(0, 120)
    if (rowSearchInput.trim().slice(0, 120) !== search || search === state.rows.search) return
    setState({ ...state, rows: { ...state.rows, page: 0, search } }, { replace: true })
  }, [debouncedRowSearch, rowSearchInput, setState, state])
  useEffect(() => {
    const search = debouncedStudentSearch.trim().slice(0, 120)
    if (
      studentSearchInput.trim().slice(0, 120) !== search ||
      search === state.students.search
    ) {
      return
    }
    setState({ ...state, students: { ...state.students, page: 0, search } }, { replace: true })
  }, [debouncedStudentSearch, setState, state, studentSearchInput])

  const updateUploads = useCallback(
    (patch: Partial<LedgerUploadsQuery>) => {
      const page = Object.keys(patch).some((key) => key !== 'page')
        ? 0
        : (patch.page ?? state.uploads.page)
      setState({ ...state, uploads: { ...state.uploads, ...patch, page } })
    },
    [setState, state],
  )
  const updateRows = useCallback(
    (patch: Partial<LedgerStagedRowsQuery>) => {
      const page = Object.keys(patch).some((key) => key !== 'page')
        ? 0
        : (patch.page ?? state.rows.page)
      setState({ ...state, rows: { ...state.rows, ...patch, page } })
    },
    [setState, state],
  )
  const updateStudents = useCallback(
    (patch: Partial<RegisteredStudentsQuery>) => {
      const page = Object.keys(patch).some((key) => key !== 'page')
        ? 0
        : (patch.page ?? state.students.page)
      setState({ ...state, students: { ...state.students, ...patch, page } })
    },
    [setState, state],
  )
  const selectUpload = useCallback(
    (uploadId: string | null) => setState({ ...state, uploadId, rows: { ...state.rows, page: 0 } }),
    [setState, state],
  )

  return {
    state,
    rowSearchInput,
    studentSearchInput,
    selectUpload,
    setRowSearchInput,
    setStudentSearchInput,
    updateRows,
    updateStudents,
    updateUploads,
  }
}
