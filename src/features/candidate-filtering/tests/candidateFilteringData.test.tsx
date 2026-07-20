import { act, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import { candidateFilteringApi } from '../api/candidateFilteringApi'
import { candidateFilteringKeys } from '../hooks/candidateFilteringQueryKeys'
import {
  parseCandidateFilteringUrlState,
  serializeCandidateFilteringUrlState,
  useCandidateFilteringUrlState,
} from '../hooks/useCandidateFilteringUrlState'

const requestId = '11111111-1111-4111-8111-111111111111'
const nextRequestId = '22222222-2222-4222-8222-222222222222'
const runId = '33333333-3333-4333-8333-333333333333'
const skillId = '44444444-4444-4444-8444-444444444444'
const additionalSkillId = '55555555-5555-4555-8555-555555555555'
const studentId = '66666666-6666-4666-8666-666666666666'
const now = '2026-07-20T09:30:00Z'

const criteria = {
  requestId,
  runtimeGpaLowerBound: 2.5,
  runtimeGpaUpperBound: 4,
  requestSkillIds: [skillId],
  additionalSkillIds: [additionalSkillId],
  skillMatchMode: 'OR' as const,
}

const run = {
  filterRunId: runId,
  request: {
    requestId,
    companyId: nextRequestId,
    companyName: 'Example Technologies',
    title: 'Software Engineering Intern',
    status: 'ACTIVE' as const,
    shortlistGuidanceValue: 10,
  },
  criteria,
  candidateCount: 1,
  createdAt: now,
}

const candidate = {
  studentId,
  indexNumber: 'SC/2022/12345',
  fullName: 'Ayesha Perera',
  officialGpa: null,
  gpaAvailabilityStatus: 'NOT_AVAILABLE' as const,
  matchingDeclaredSkills: [],
  declaredSkillCount: 2,
  hasLatestSavedCv: false,
  hasExistingActiveShortlist: false,
  existingActiveShortlistCount: 0,
}

describe('candidate filtering API and URL state', () => {
  it('creates and restores a run, then reads server-paged candidates', async () => {
    const calls: Array<{ method: string; search?: string; body?: unknown }> = []
    server.use(
      http.post('/api/v1/admin/candidate-filtering/runs', async ({ request }) => {
        calls.push({ method: request.method, body: await request.json() })
        return HttpResponse.json(run, { status: 201 })
      }),
      http.get('/api/v1/admin/candidate-filtering/runs/:runId/candidates', ({ request }) => {
        calls.push({ method: request.method, search: new URL(request.url).search })
        return HttpResponse.json({
          items: [candidate],
          page: {
            page: 2,
            size: 50,
            totalElements: 101,
            totalPages: 3,
            sort: 'fullName,asc',
          },
        })
      }),
      http.get('/api/v1/admin/candidate-filtering/runs/:runId', () => HttpResponse.json(run)),
    )

    await expect(candidateFilteringApi.createRun(criteria)).resolves.toEqual(run)
    await expect(candidateFilteringApi.getRun(runId)).resolves.toEqual(run)
    await expect(
      candidateFilteringApi.listCandidates({
        filterRunId: runId,
        page: 2,
        size: 50,
        search: 'Ayesha',
        sort: 'fullName,asc',
      }),
    ).resolves.toEqual(expect.objectContaining({ items: [candidate] }))
    expect(calls).toEqual([
      { method: 'POST', body: criteria },
      { method: 'GET', search: '?page=2&size=50&search=Ayesha&sort=fullName%2Casc' },
    ])
  })

  it('round-trips repeated skill IDs and rejects invalid URL values', () => {
    const parsed = parseCandidateFilteringUrlState(
      new URLSearchParams(
        `requestId=${requestId}&minGpa=2.5&maxGpa=4&requestSkillIds=${skillId}&requestSkillIds=${skillId}&additionalSkillIds=${additionalSkillId}&matchMode=OR&runId=${runId}&candidateSearch=Ayesha&candidateSort=fullName%2Casc&candidatePage=2&candidateSize=50`,
      ),
    )
    expect(parsed).toEqual({
      requestId,
      minGpa: 2.5,
      maxGpa: 4,
      requestSkillIds: [skillId],
      additionalSkillIds: [additionalSkillId],
      matchMode: 'OR',
      runId,
      candidateSearch: 'Ayesha',
      candidateSort: 'fullName,asc',
      candidatePage: 2,
      candidateSize: 50,
    })
    expect(serializeCandidateFilteringUrlState(parsed).getAll('requestSkillIds')).toEqual([skillId])
    expect(
      parseCandidateFilteringUrlState(
        new URLSearchParams('minGpa=2.555&maxGpa=9&matchMode=NOT&candidateSize=4'),
      ),
    ).toEqual(expect.objectContaining({ minGpa: undefined, maxGpa: undefined, candidateSize: 20 }))
  })

  it('clears stale run context when the selected request changes', () => {
    function Wrapper({ children }: PropsWithChildren) {
      return (
        <MemoryRouter
          initialEntries={[
            `/?companyActive=false&requestId=${requestId}&requestSkillIds=${skillId}&runId=${runId}`,
          ]}
        >
          {children}
        </MemoryRouter>
      )
    }
    const { result } = renderHook(() => useCandidateFilteringUrlState(), { wrapper: Wrapper })
    act(() => result.current.updateState({ requestId: nextRequestId }))
    expect(result.current.state.requestId).toBe(nextRequestId)
    expect(result.current.state.runId).toBeUndefined()
    expect(result.current.state.requestSkillIds).toEqual([])
  })

  it('uses distinct stable cache keys for run metadata and candidate pages', () => {
    const query = {
      filterRunId: runId,
      page: 0,
      size: 20 as const,
      search: '',
      sort: 'officialGpa,desc' as const,
    }
    expect(candidateFilteringKeys.run(runId)).toEqual([
      'protected',
      'candidate-filtering',
      'runs',
      runId,
    ])
    expect(candidateFilteringKeys.candidates(query)).toEqual([
      ...candidateFilteringKeys.run(runId),
      'candidates',
      query,
    ])
  })
})
