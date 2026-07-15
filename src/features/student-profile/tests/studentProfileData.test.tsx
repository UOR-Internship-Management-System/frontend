import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { createQueryClient } from '../../../app/config/queryClient'
import { createStudentProfileFixture } from '../../../mocks/fixtures/studentProfile.fixture'
import { server } from '../../../mocks/server'
import { formatIfMatchVersion } from '../../../shared/api/formatIfMatchVersion'
import { studentProfileApi } from '../api/studentProfileApi'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { useUpdateStudentProfile } from '../hooks/useUpdateStudentProfile'
import {
  mapStudentProfileResponse,
  mapStudentProfileToForm,
  mapStudentProfileUpdateRequest,
} from '../mappers/studentProfileMapper'
import { studentProfileFormSchema } from '../schemas/studentProfileSchemas'

const apiPath = '/api/v1/me/profile'

function createWrapper() {
  const queryClient = createQueryClient()
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { Wrapper }
}

describe('Student Profile data layer', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps changed editable fields only and converts optional blanks to null', () => {
    const profile = mapStudentProfileResponse(createStudentProfileFixture())
    const baseline = mapStudentProfileToForm(profile)
    const request = mapStudentProfileUpdateRequest(
      { ...baseline, fullName: '  Updated Student  ', personalEmail: '  ' },
      baseline,
    )

    expect(request).toEqual({ fullName: 'Updated Student', personalEmail: null })
    expect(request).not.toHaveProperty('indexNumber')
    expect(request).not.toHaveProperty('universityEmail')
    expect(request).not.toHaveProperty('version')
  })

  it('validates every editable core field without inventing a summary limit', () => {
    expect(
      studentProfileFormSchema.parse({
        fullName: ' Student ',
        personalEmail: '',
        headline: ' Engineer ',
        summary: ' Summary ',
        phone: ' ',
        location: ' Matara ',
      }),
    ).toEqual({
      fullName: 'Student',
      personalEmail: '',
      headline: 'Engineer',
      summary: 'Summary',
      phone: '',
      location: 'Matara',
    })
  })

  it('uses a quoted If-Match value and an identity-safe PATCH body', async () => {
    let requestBody: unknown
    let ifMatch: string | null = null
    const loaded = await studentProfileApi.getCurrent()
    const baseline = mapStudentProfileToForm(loaded)
    server.use(
      http.patch(apiPath, async ({ request }) => {
        requestBody = await request.json()
        ifMatch = request.headers.get('If-Match')
        return HttpResponse.json(
          createStudentProfileFixture({ fullName: 'Updated Student', version: 2 }),
        )
      }),
    )

    const updated = await studentProfileApi.updateCurrent(
      { ...baseline, fullName: 'Updated Student' },
      loaded.version,
      baseline,
    )

    expect(ifMatch).toBe('"1"')
    expect(requestBody).toEqual({ fullName: 'Updated Student' })
    expect(updated.fullName).toBe('Updated Student')
    expect(formatIfMatchVersion(12)).toBe('"12"')
  })

  it('rejects an unsafe profile photo URL instead of substituting mock data', async () => {
    server.use(
      http.get(apiPath, () =>
        HttpResponse.json(
          createStudentProfileFixture({
            profilePhoto: {
              ...createStudentProfileFixture().profilePhoto!,
              url: 'javascript:alert(1)',
            },
          }),
        ),
      ),
    )

    await expect(studentProfileApi.getCurrent()).rejects.toBeInstanceOf(ZodError)
  })

  it('loads and read-after-write refreshes the active Profile query', async () => {
    const { Wrapper } = createWrapper()
    const initialProfile = mapStudentProfileResponse(createStudentProfileFixture())
    const committedProfile = mapStudentProfileResponse(
      createStudentProfileFixture({ fullName: 'Committed Student', version: 2 }),
    )
    const baseline = mapStudentProfileToForm(initialProfile)
    const values = { ...baseline, fullName: 'Committed Student' }
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
      await result.current.update.mutateAsync({ baseline, values, version: 1 })
    })

    await waitFor(() => expect(result.current.profile.data?.fullName).toBe('Committed Student'))
    expect(updateProfile).toHaveBeenCalledWith(values, 1, baseline)
    expect(getProfile).toHaveBeenCalledTimes(2)
  })
})
