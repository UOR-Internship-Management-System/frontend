import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  parseCandidateFilteringUrlState,
  serializeCandidateFilteringUrlState,
  useCandidateFilteringUrlState,
} from '../hooks/useCandidateFilteringUrlState'

const requestA = '11111111-1111-4111-8111-111111111111'
const requestB = '22222222-2222-4222-8222-222222222222'
const skillId = '33333333-3333-4333-8333-333333333333'
const runId = '44444444-4444-4444-8444-444444444444'

describe('Candidate Filtering URL state', () => {
  it('parses and serializes only valid runtime criteria', () => {
    const parsed = parseCandidateFilteringUrlState(
      new URLSearchParams(
        `requestId=${requestA}&minGpa=2.75&maxGpa=4&requestSkillIds=${skillId}&additionalSkillIds=bad&matchMode=OR&runId=${runId}&candidateSort=fullName%2Casc&candidatePage=2&candidateSize=50`,
      ),
    )

    expect(parsed).toEqual({
      requestId: requestA,
      minGpa: 2.75,
      maxGpa: 4,
      requestSkillIds: [skillId],
      additionalSkillIds: [],
      matchMode: 'OR',
      runId,
      candidateSearch: '',
      candidateSort: 'fullName,asc',
      candidatePage: 2,
      candidateSize: 50,
    })
    expect(serializeCandidateFilteringUrlState(parsed).toString()).toContain('minGpa=2.75')
  })

  it('clears request-specific criteria when the Admin changes the request', () => {
    function Wrapper({ children }: PropsWithChildren) {
      return (
        <MemoryRouter
          initialEntries={[
            `/?requestId=${requestA}&minGpa=3&maxGpa=4&requestSkillIds=${skillId}&additionalSkillIds=${skillId}&matchMode=OR&runId=${runId}&candidateSearch=Ayesha&candidateSort=fullName%2Casc&candidatePage=3`,
          ]}
        >
          {children}
        </MemoryRouter>
      )
    }

    const { result } = renderHook(() => useCandidateFilteringUrlState(), { wrapper: Wrapper })

    act(() => result.current.updateState({ requestId: requestB }))

    expect(result.current.state).toEqual(
      expect.objectContaining({
        requestId: requestB,
        minGpa: undefined,
        maxGpa: undefined,
        requestSkillIds: [],
        additionalSkillIds: [],
        matchMode: 'AND',
        runId: undefined,
        candidateSearch: '',
        candidateSort: 'officialGpa,desc',
        candidatePage: 0,
      }),
    )
  })
})