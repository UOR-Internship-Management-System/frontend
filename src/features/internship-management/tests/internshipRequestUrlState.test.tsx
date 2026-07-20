import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { server } from '../../../mocks/server'
import { useInternshipRequests } from '../hooks/useInternshipRequests'
import {
  parseInternshipRequestsUrlState,
  serializeInternshipRequestsUrlState,
  useInternshipRequestsUrlState,
} from '../hooks/useInternshipRequestsUrlState'

const companyId = '11111111-1111-4111-8111-111111111111'
const requestId = '33333333-3333-4333-8333-333333333333'
const now = '2026-07-20T09:30:00Z'
const response = {
  requestId,
  company: {
    companyId,
    name: 'Example Technologies',
    websiteUrl: null,
    contactPerson: null,
    contactEmail: null,
    contactPhone: null,
    notes: null,
    active: true,
    version: 1,
    createdAt: now,
    updatedAt: now,
  },
  title: 'Software Engineering Intern',
  description: null,
  location: null,
  workMode: null,
  status: 'DRAFT',
  shortlistGuidanceValue: null,
  notes: null,
  requiredSkills: [],
  version: 1,
  createdAt: now,
  updatedAt: now,
}

describe('Internship request URL and server list state', () => {
  it('parses and serializes prefixed request state with strict enum and UUID handling', () => {
    const parsed = parseInternshipRequestsUrlState(
      new URLSearchParams(
        `requestSearch=Engineer&requestStatus=ACTIVE&requestCompanyId=${companyId}&requestSort=title%2Casc&requestPage=2&requestSize=50&requestId=${requestId}`,
      ),
    )
    expect(parsed).toEqual({
      page: 2,
      size: 50,
      sort: 'title,asc',
      search: 'Engineer',
      status: 'ACTIVE',
      companyId,
      selectedRequestId: requestId,
    })
    expect(serializeInternshipRequestsUrlState(parsed).toString()).toContain('requestStatus=ACTIVE')
    expect(
      parseInternshipRequestsUrlState(
        new URLSearchParams('requestStatus=UNKNOWN&requestCompanyId=bad&requestSize=4'),
      ),
    ).toEqual(expect.objectContaining({ status: undefined, companyId: undefined, size: 20 }))
  })

  it('debounces search and resets the independent request page', async () => {
    function Wrapper({ children }: PropsWithChildren) {
      return (
        <MemoryRouter initialEntries={['/?requestPage=4&requestStatus=DRAFT']}>
          {children}
        </MemoryRouter>
      )
    }
    const { result } = renderHook(() => useInternshipRequestsUrlState(), { wrapper: Wrapper })
    expect(result.current.state.page).toBe(4)
    act(() => result.current.setSearchInput('platform'))
    await waitFor(
      () =>
        expect(result.current.state).toEqual(
          expect.objectContaining({ page: 0, search: 'platform' }),
        ),
      { timeout: 2_000 },
    )
    act(() => result.current.updateState({ companyId }))
    expect(result.current.state.page).toBe(0)
    expect(result.current.state.companyId).toBe(companyId)
  })

  it('loads request pages through React Query with contract validation', async () => {
    server.use(
      http.get('/api/v1/admin/internship-requests', () =>
        HttpResponse.json({
          items: [response],
          page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'createdAt,desc' },
        }),
      ),
    )
    const queryClient = createQueryClient()
    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }
    const query = { page: 0, size: 20 as const, sort: 'createdAt,desc' as const, search: '' }
    const { result } = renderHook(() => useInternshipRequests(query), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items[0]?.title).toBe('Software Engineering Intern')
  })
})
