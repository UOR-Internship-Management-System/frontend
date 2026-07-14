import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { createQueryClient } from '../../../app/config/queryClient'
import { createStudentProfileFixture } from '../../../mocks/fixtures/studentProfile.fixture'
import { server } from '../../../mocks/server'
import { studentProfileApi } from '../api/studentProfileApi'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { useUpdateStudentProfile } from '../hooks/useUpdateStudentProfile'
import {
  mapStudentProfileResponse,
  mapStudentProfileUpdateRequest,
} from '../mappers/studentProfileMapper'
import { studentProfileFormSchema } from '../schemas/studentProfileSchemas'

const apiPath = '/api/v1/me/profile'

function createWrapper() {
  const queryClient = createQueryClient()
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, Wrapper }
}

describe('Student Profile data layer', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps only editable fields into the PATCH request', () => {
    const request = mapStudentProfileUpdateRequest({
      fullName: '  Updated Student  ',
      summary: '  Updated summary  ',
      phone: '  +94 77 000 0000  ',
    })

    expect(request).toEqual({
      fullName: 'Updated Student',
      summary: 'Updated summary',
      phone: '+94 77 000 0000',
    })
    expect(request).not.toHaveProperty('indexNumber')
    expect(request).not.toHaveProperty('universityEmail')
  })

  it('normalizes the confirmed core form without inventing length limits', () => {
    expect(
      studentProfileFormSchema.parse({ fullName: ' Student ', summary: ' Summary ', phone: ' ' }),
    ).toEqual({ fullName: 'Student', summary: 'Summary', phone: '' })
  })

  it('uses GET and PATCH /me/profile with an identity-safe body', async () => {
    let requestBody: unknown
    server.use(
      http.patch(apiPath, async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json(
          createStudentProfileFixture({ fullName: 'Updated Student', summary: '', phone: '' }),
        )
      }),
    )

    const loaded = await studentProfileApi.getCurrent()
    const updated = await studentProfileApi.updateCurrent({
      fullName: 'Updated Student',
      summary: '',
      phone: '',
    })

    expect(loaded.indexNumber).toBe('SC/2022/12345')
    expect(requestBody).toEqual({ fullName: 'Updated Student', summary: '', phone: '' })
    expect(updated.fullName).toBe('Updated Student')
  })

  it('rejects an unsafe profile photo URL instead of rendering malformed data', async () => {
    server.use(
      http.get(apiPath, () =>
        HttpResponse.json(createStudentProfileFixture({ profilePhotoUrl: 'javascript:alert(1)' })),
      ),
    )

    await expect(studentProfileApi.getCurrent()).rejects.toBeInstanceOf(ZodError)
  })

  it('loads and read-after-write refreshes the active Profile query', async () => {
    const { Wrapper } = createWrapper()
    const initialProfile = mapStudentProfileResponse(createStudentProfileFixture())
    const committedProfile = mapStudentProfileResponse(
      createStudentProfileFixture({
        fullName: 'Committed Student',
        summary: 'Committed summary',
        phone: '+94 76 111 1111',
      }),
    )
    const getProfile = vi
      .spyOn(studentProfileApi, 'getCurrent')
      .mockResolvedValueOnce(initialProfile)
      .mockResolvedValue(committedProfile)
    const updateProfile = vi
      .spyOn(studentProfileApi, 'updateCurrent')
      .mockResolvedValue(committedProfile)
    const { result } = renderHook(
      () => ({ profile: useStudentProfile(), update: useUpdateStudentProfile() }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.profile.isSuccess).toBe(true))
    expect(getProfile.mock.calls[0]?.[0]).toBeInstanceOf(AbortSignal)

    await act(async () => {
      await result.current.update.mutateAsync({
        fullName: 'Committed Student',
        summary: 'Committed summary',
        phone: '+94 76 111 1111',
      })
    })

    await waitFor(() => expect(result.current.profile.data?.fullName).toBe('Committed Student'))
    expect(result.current.update.isSuccess).toBe(true)
    expect(updateProfile).toHaveBeenCalledWith({
      fullName: 'Committed Student',
      summary: 'Committed summary',
      phone: '+94 76 111 1111',
    })
    expect(getProfile).toHaveBeenCalledTimes(2)
  })
})
