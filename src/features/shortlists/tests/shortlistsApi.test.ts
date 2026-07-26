import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../../../mocks/server'
import { shortlistsApi } from '../api/shortlistsApi'

const shortlistId = '11111111-1111-4111-8111-111111111111'
const requestId = '22222222-2222-4222-8222-222222222222'
const companyId = '33333333-3333-4333-8333-333333333333'
const studentId = '44444444-4444-4444-8444-444444444444'
const now = '2026-07-21T09:30:00Z'

const shortlist = {
  shortlistId,
  request: {
    requestId,
    companyId,
    companyName: 'Example Technologies',
    title: 'Software Engineering Intern',
    status: 'ACTIVE' as const,
    shortlistGuidanceValue: 10,
  },
  filterRunId: null,
  name: null,
  status: 'DRAFT' as const,
  guidanceValue: 10,
  selectedCandidateCount: 1,
  guidanceExceeded: false,
  guidanceWarning: null,
  version: 3,
  createdAt: now,
  updatedAt: now,
  finalizedAt: null,
}

const page = {
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  sort: 'updatedAt,desc',
}

describe('shortlists API', () => {
  it('sends every server-side shortlist list parameter', async () => {
    let requestUrl = ''
    server.use(
      http.get('/api/v1/admin/shortlists', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ items: [shortlist], page })
      }),
    )

    await shortlistsApi.listShortlists({
      page: 2,
      size: 50,
      search: 'software',
      status: 'DRAFT',
      companyId,
      sort: 'companyName,asc',
    })

    const url = new URL(requestUrl)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('size')).toBe('50')
    expect(url.searchParams.get('search')).toBe('software')
    expect(url.searchParams.get('status')).toBe('DRAFT')
    expect(url.searchParams.get('companyId')).toBe(companyId)
    expect(url.searchParams.get('sort')).toBe('companyName,asc')
  })

  it('loads paged candidate detail with contract-defined query parameters', async () => {
    let requestUrl = ''
    server.use(
      http.get('/api/v1/admin/shortlists/:shortlistId', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({
          shortlist,
          candidates: {
            items: [],
            page: { ...page, size: 50, sort: 'fullName,asc' },
          },
        })
      }),
    )

    await shortlistsApi.getShortlistDetail({
      shortlistId,
      candidatePage: 1,
      candidateSize: 50,
      candidateSearch: 'Ayesha',
      candidateSort: 'fullName,asc',
    })

    const url = new URL(requestUrl)
    expect(url.searchParams.get('candidatePage')).toBe('1')
    expect(url.searchParams.get('candidateSize')).toBe('50')
    expect(url.searchParams.get('candidateSearch')).toBe('Ayesha')
    expect(url.searchParams.get('sort')).toBe('fullName,asc')
    expect(url.searchParams.has('candidateSort')).toBe(false)
  })

  it('uses quoted If-Match versions for add, remove, and finalization mutations', async () => {
    const addCall = vi.fn()
    const removeCall = vi.fn()
    const finalizeCall = vi.fn()

    server.use(
      http.post('/api/v1/admin/shortlists/:shortlistId/candidates', async ({ request }) => {
        addCall(request.headers.get('If-Match'), await request.json())
        return HttpResponse.json({
          shortlistId,
          addedCount: 1,
          alreadyPresentCount: 0,
          removedCount: 0,
          selectedCandidateCount: 2,
          guidanceExceeded: false,
          version: 4,
        })
      }),
      http.delete('/api/v1/admin/shortlists/:shortlistId/candidates/:studentId', ({ request }) => {
        removeCall(request.headers.get('If-Match'))
        return HttpResponse.json({
          shortlistId,
          addedCount: 0,
          alreadyPresentCount: 0,
          removedCount: 1,
          selectedCandidateCount: 1,
          guidanceExceeded: false,
          version: 5,
        })
      }),
      http.post('/api/v1/admin/shortlists/:shortlistId/finalize', async ({ request }) => {
        finalizeCall(request.headers.get('If-Match'), await request.json())
        return HttpResponse.json({
          shortlistId,
          status: 'FINALIZED',
          selectedCandidateCount: 1,
          guidanceValue: 10,
          guidanceExceeded: false,
          guidanceAcknowledged: false,
          version: 6,
          finalizedAt: now,
        })
      }),
    )

    await shortlistsApi.addCandidates({
      shortlistId,
      version: 3,
      body: { studentIds: [studentId] },
    })
    await shortlistsApi.removeCandidate({ shortlistId, studentId, version: 4 })
    await shortlistsApi.finalize({
      shortlistId,
      version: 5,
      body: { acknowledgeGuidanceWarning: false },
    })

    expect(addCall).toHaveBeenCalledWith('"3"', { studentIds: [studentId] })
    expect(removeCall).toHaveBeenCalledWith('"4"')
    expect(finalizeCall).toHaveBeenCalledWith('"5"', {
      acknowledgeGuidanceWarning: false,
    })
  })
})
