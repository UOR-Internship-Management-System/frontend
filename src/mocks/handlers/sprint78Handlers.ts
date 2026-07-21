import { http, HttpResponse } from 'msw'
import type { ApiExportJobResponse } from '../../shared/api/generated/cvManagementApi.types'
import {
  sprint78CandidatesFixture,
  sprint78CompaniesFixture,
  sprint78FilterRunsFixture,
  sprint78InternshipRequestsFixture,
  sprint78ShortlistCandidatesFixture,
  sprint78ShortlistsFixture,
} from '../fixtures/sprint78.fixture'

const apiBase = '/api/v1'
const exportJobs = new Map<string, ApiExportJobResponse>()
let exportSequence = 1

function page<T>(items: T[], request: Request, defaultSort: string) {
  const url = new URL(request.url)
  const pageNumber = Number(
    url.searchParams.get('page') ?? url.searchParams.get('candidatePage') ?? 0,
  )
  const size = Number(url.searchParams.get('size') ?? url.searchParams.get('candidateSize') ?? 20)
  const sort = url.searchParams.get('sort') ?? defaultSort
  return {
    items: items.slice(pageNumber * size, pageNumber * size + size),
    page: {
      page: pageNumber,
      size,
      totalElements: items.length,
      totalPages: items.length ? Math.ceil(items.length / size) : 0,
      sort,
    },
  }
}

function newExportJob(shortlistId: string, type: 'summary' | 'bulk') {
  const exportJobId = `90000000-0000-4000-8000-${String(exportSequence++).padStart(12, '0')}`
  const shortlist = sprint78ShortlistsFixture.find((item) => item.shortlistId === shortlistId)
  const totalCandidateCount = shortlist?.selectedCandidateCount ?? 0
  const job: ApiExportJobResponse = {
    exportJobId,
    shortlistId,
    exportType: type === 'summary' ? 'SHORTLIST_SUMMARY_CSV' : 'BULK_LATEST_CV_ZIP',
    format: type === 'summary' ? 'CSV' : 'ZIP',
    status: 'QUEUED',
    totalCandidateCount,
    includedFileCount: 0,
    missingCvCount: 0,
    missingCvStudents: [],
    warnings: [],
    downloadReady: false,
    downloadUrl: null,
    createdAt: '2026-07-21T10:00:00+05:30',
    startedAt: null,
    completedAt: null,
    expiresAt: null,
    failureCode: null,
    failureMessage: null,
  }
  exportJobs.set(exportJobId, job)
  return job
}

export const sprint78Handlers = [
  http.get(`${apiBase}/admin/companies`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const active = url.searchParams.get('active')
    const items = sprint78CompaniesFixture.filter(
      (company) =>
        (!search ||
          `${company.name} ${company.contactPerson ?? ''}`.toLowerCase().includes(search)) &&
        (!active || String(company.active) === active),
    )
    return HttpResponse.json(page(items, request, 'name,asc'))
  }),

  http.get(`${apiBase}/admin/internship-requests`, ({ request }) => {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('companyId')
    const status = url.searchParams.get('status')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const items = sprint78InternshipRequestsFixture.filter(
      (item) =>
        (!companyId || item.company.companyId === companyId) &&
        (!status || item.status === status) &&
        (!search || `${item.title} ${item.company.name}`.toLowerCase().includes(search)),
    )
    return HttpResponse.json(page(items, request, 'createdAt,desc'))
  }),

  http.post(`${apiBase}/admin/candidate-filtering/runs`, () =>
    HttpResponse.json(sprint78FilterRunsFixture[0], { status: 201 }),
  ),

  http.get(`${apiBase}/admin/candidate-filtering/runs/:filterRunId/candidates`, ({ request }) =>
    HttpResponse.json(page(sprint78CandidatesFixture, request, 'officialGpa,desc')),
  ),

  http.get(`${apiBase}/admin/shortlists`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const status = url.searchParams.get('status')
    const companyId = url.searchParams.get('companyId')
    const items = sprint78ShortlistsFixture.filter(
      (item) =>
        (!status || item.status === status) &&
        (!companyId || item.request.companyId === companyId) &&
        (!search ||
          `${item.name ?? ''} ${item.request.companyName} ${item.request.title}`
            .toLowerCase()
            .includes(search)),
    )
    return HttpResponse.json(page(items, request, 'updatedAt,desc'))
  }),

  http.get(`${apiBase}/admin/shortlists/:shortlistId`, ({ params, request }) => {
    const shortlistId = String(params.shortlistId)
    const shortlist = sprint78ShortlistsFixture.find((item) => item.shortlistId === shortlistId)
    if (!shortlist) {
      return HttpResponse.json(
        {
          title: 'Not found',
          status: 404,
          code: 'SHORTLIST_NOT_FOUND',
          message: 'The shortlist was not found.',
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      shortlist,
      candidates: page(
        sprint78ShortlistCandidatesFixture[shortlistId] ?? [],
        request,
        'officialGpa,desc',
      ),
    })
  }),

  http.post(`${apiBase}/admin/exports/shortlists/:shortlistId`, ({ params }) =>
    HttpResponse.json(newExportJob(String(params.shortlistId), 'summary'), {
      status: 202,
      headers: { 'Retry-After': '1' },
    }),
  ),

  http.post(`${apiBase}/admin/exports/shortlists/:shortlistId/bulk-cvs`, ({ params }) =>
    HttpResponse.json(newExportJob(String(params.shortlistId), 'bulk'), {
      status: 202,
      headers: { 'Retry-After': '1' },
    }),
  ),

  http.get(`${apiBase}/admin/exports/:exportJobId`, ({ params }) => {
    const exportJobId = String(params.exportJobId)
    const current = exportJobs.get(exportJobId)
    if (!current) {
      return HttpResponse.json(
        {
          title: 'Not found',
          status: 404,
          code: 'EXPORT_JOB_NOT_FOUND',
          message: 'The export job was not found.',
        },
        { status: 404 },
      )
    }
    const completed: ApiExportJobResponse = {
      ...current,
      status: 'COMPLETED',
      includedFileCount:
        current.exportType === 'SHORTLIST_SUMMARY_CSV' ? 1 : current.totalCandidateCount,
      downloadReady: true,
      downloadUrl:
        current.exportType === 'SHORTLIST_SUMMARY_CSV'
          ? `/admin/exports/${exportJobId}/download`
          : `/admin/exports/${exportJobId}/bulk-cvs/download`,
      startedAt: '2026-07-21T10:00:01+05:30',
      completedAt: '2026-07-21T10:00:02+05:30',
      expiresAt: '2026-07-22T10:00:02+05:30',
    }
    exportJobs.set(exportJobId, completed)
    return HttpResponse.json(completed)
  }),

  http.get(
    `${apiBase}/admin/exports/:exportJobId/download`,
    () =>
      new HttpResponse('indexNumber,fullName\nSC/2022/12347,Nethmi Wijesinghe', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="shortlist-summary.csv"',
        },
      }),
  ),

  http.get(
    `${apiBase}/admin/exports/:exportJobId/bulk-cvs/download`,
    () =>
      new HttpResponse('mock-zip-content', {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="latest-saved-cvs.zip"',
        },
      }),
  ),

  http.get(
    `${apiBase}/admin/students/:studentId/latest-cv/download`,
    () =>
      new HttpResponse('mock-pdf-content', {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="student-latest-cv.pdf"',
        },
      }),
  ),
]
