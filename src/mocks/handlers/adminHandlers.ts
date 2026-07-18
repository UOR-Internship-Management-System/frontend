import { http, HttpResponse } from 'msw'
import { adminDashboardMetricsFixture } from '../fixtures/adminDashboard.fixture'
import { registeredStudentsFixture } from '../fixtures/registeredStudents.fixture'
import {
  ledgerStagedRowsFixture,
  ledgerUploadDetailFixture,
  ledgerUploadId,
  ledgerUploadsFixture,
  ledgerValidationFixture,
} from '../fixtures/academicLedger.fixture'

const apiBase = '/api/v1'

export const adminHandlers = [
  http.get(`${apiBase}/admin/dashboard/metrics`, () =>
    HttpResponse.json(adminDashboardMetricsFixture),
  ),
  http.get(`${apiBase}/admin/students`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const level = url.searchParams.get('level')
    const sort = url.searchParams.get('sort') ?? 'fullName,asc'
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)
    const filtered = registeredStudentsFixture.filter((student) => {
      const searchable =
        `${student.fullName} ${student.indexNumber} ${student.universityEmail} ${student.academicBatch}`.toLowerCase()
      return (
        (!search || searchable.includes(search)) &&
        (!level || String(student.currentLevel) === level)
      )
    })
    const sorted = [...filtered].sort((left, right) => {
      if (sort === 'officialGpa,desc' || sort === 'officialGpa,asc') {
        const leftGpa = left.officialGpa
        const rightGpa = right.officialGpa
        if (leftGpa === null) return 1
        if (rightGpa === null) return -1
        return sort.endsWith('desc') ? rightGpa - leftGpa : leftGpa - rightGpa
      }
      if (sort === 'indexNumber,asc') return left.indexNumber.localeCompare(right.indexNumber)
      return left.fullName.localeCompare(right.fullName)
    })
    const items = sorted.slice(page * size, page * size + size)
    return HttpResponse.json({
      items,
      page: {
        page,
        size,
        totalElements: sorted.length,
        totalPages: Math.ceil(sorted.length / size),
        sort,
      },
    })
  }),
  http.post(`${apiBase}/admin/academic-ledger/uploads`, () => {
    return HttpResponse.json(
      {
        ...ledgerUploadDetailFixture,
        originalFilename: 'uploaded-academic-ledger.csv',
        fileSizeBytes: 24,
        uploadStatus: 'PROCESSING',
        validationStatus: 'NOT_STARTED',
        totalRows: 0,
        validRows: 0,
        statusMessage: 'The file was accepted and processing has started.',
        nextPollAfterSeconds: 1,
      },
      {
        status: 202,
        headers: {
          Location: `${apiBase}/admin/academic-ledger/uploads/${ledgerUploadId}`,
          'Retry-After': '1',
        },
      },
    )
  }),
  http.get(`${apiBase}/admin/academic-ledger/uploads`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const status = url.searchParams.get('status')
    const items = ledgerUploadsFixture.filter(
      (item) =>
        (!search || item.originalFilename.toLowerCase().includes(search)) &&
        (!status || item.uploadStatus === status),
    )
    return HttpResponse.json({
      items: items.slice(page * size, page * size + size),
      page: {
        page,
        size,
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size),
        sort: url.searchParams.get('sort') ?? 'uploadedAt,desc',
      },
    })
  }),
  http.get(`${apiBase}/admin/academic-ledger/uploads/:uploadId`, ({ params }) =>
    HttpResponse.json({ ...ledgerUploadDetailFixture, uploadId: String(params.uploadId) }),
  ),
  http.get(
    `${apiBase}/admin/academic-ledger/uploads/:uploadId/staged-rows`,
    ({ request, params }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page') ?? 0)
      const size = Number(url.searchParams.get('size') ?? 20)
      const search = (url.searchParams.get('search') ?? '').toLowerCase()
      const status = url.searchParams.get('validationStatus')
      const items = ledgerStagedRowsFixture
        .filter(
          (row) =>
            (!search ||
              `${row.studentIndexNumber} ${row.courseCode}`.toLowerCase().includes(search)) &&
            (!status || row.validationStatus === status),
        )
        .map((row) => ({ ...row, uploadId: String(params.uploadId) }))
      return HttpResponse.json({
        items: items.slice(page * size, page * size + size),
        page: {
          page,
          size,
          totalElements: items.length,
          totalPages: Math.ceil(items.length / size),
          sort: url.searchParams.get('sort') ?? 'rowNumber,asc',
        },
      })
    },
  ),
  http.get(`${apiBase}/admin/academic-ledger/uploads/:uploadId/validation-results`, ({ params }) =>
    HttpResponse.json({ ...ledgerValidationFixture, uploadId: String(params.uploadId) }),
  ),
  http.post(`${apiBase}/admin/academic-ledger/uploads/:uploadId/commit`, ({ params }) =>
    HttpResponse.json({
      uploadId: String(params.uploadId),
      status: 'COMMITTED',
      committedRecords: 4,
      affectedStudents: 4,
      recalculatedGpaCount: 4,
      committedAt: '2026-07-18T09:00:00+05:30',
    }),
  ),
]
