import { http, HttpResponse } from 'msw'
import { pagedAcademicRecordsSchema } from '../../features/academic-records/schemas/academicRecordSchemas'
import type { AcademicRecord } from '../../features/academic-records/types/academicRecordTypes'
import {
  getAcademicRecordsFixtureState,
  type AcademicRecordsFailure,
} from '../fixtures/academicRecords.fixture'

const apiBase = '/api/v1'

function problem(failure: Exclude<AcademicRecordsFailure, null>) {
  const status = failure === 'unauthorized' ? 401 : 503
  const code = failure === 'unauthorized' ? 'UNAUTHORIZED' : 'ACADEMIC_RECORDS_UNAVAILABLE'
  return HttpResponse.json(
    {
      type: `https://uor-cv-system/errors/${code.toLowerCase().replaceAll('_', '-')}`,
      title: failure === 'unauthorized' ? 'Authentication required' : 'Service unavailable',
      status,
      code,
      message:
        failure === 'unauthorized'
          ? 'Authentication is required.'
          : 'Academic records are temporarily unavailable.',
      correlationId: `mock-academic-${status}`,
    },
    { status },
  )
}

function academicRecordSearchText(record: AcademicRecord) {
  return [
    record.courseCode,
    record.courseTitle,
    record.academicYear,
    record.semester,
    record.letterGrade,
    record.resultStatus,
  ]
    .join(' ')
    .toLowerCase()
}

function sortValue(record: AcademicRecord, field: string): string | number {
  switch (field) {
    case 'academicYear':
    case 'semester':
    case 'courseCode':
    case 'courseTitle':
    case 'letterGrade':
    case 'committedAt':
      return record[field]
    case 'credits':
    case 'gradePoint':
      return record[field]
    default:
      return record.academicYear
  }
}

function compareRecords(left: AcademicRecord, right: AcademicRecord, field: string) {
  const leftValue = sortValue(left, field)
  const rightValue = sortValue(right, field)
  return typeof leftValue === 'number' && typeof rightValue === 'number'
    ? leftValue - rightValue
    : String(leftValue).localeCompare(String(rightValue))
}

export const academicRecordsHandlers = [
  http.get(`${apiBase}/me/academic-records/gpa`, () => {
    const state = getAcademicRecordsFixtureState()
    return state.gpaFailure ? problem(state.gpaFailure) : HttpResponse.json(state.gpa)
  }),
  http.get(`${apiBase}/me/academic-records`, ({ request }) => {
    const state = getAcademicRecordsFixtureState()
    if (state.recordsFailure) return problem(state.recordsFailure)

    const url = new URL(request.url)
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
    const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 20)))
    const sort = url.searchParams.get('sort') ?? 'academicYear,desc'
    const [field, direction = 'asc'] = sort.split(',')
    const multiplier = direction === 'desc' ? -1 : 1
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const values = [...state.records]
      .filter((record) => !search || academicRecordSearchText(record).includes(search))
      .sort((left, right) => compareRecords(left, right, field) * multiplier)

    return HttpResponse.json(
      pagedAcademicRecordsSchema.parse({
        items: values.slice(page * size, page * size + size),
        page: {
          page,
          size,
          totalElements: values.length,
          totalPages: Math.ceil(values.length / size),
          sort,
        },
      }),
    )
  }),
]
