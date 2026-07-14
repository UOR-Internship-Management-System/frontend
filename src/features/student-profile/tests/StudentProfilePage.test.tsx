import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStudentProfileFixture } from '../../../mocks/fixtures/studentProfile.fixture'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { mapStudentProfileResponse } from '../mappers/studentProfileMapper'
import { StudentProfilePage } from '../pages/StudentProfilePage'
import type { StudentProfileFormValues } from '../types/studentProfileTypes'

const hookMocks = vi.hoisted(() => ({
  useStudentProfile: vi.fn(),
  useUpdateStudentProfile: vi.fn(),
}))

vi.mock('../hooks/useStudentProfile', () => ({
  useStudentProfile: hookMocks.useStudentProfile,
}))

vi.mock('../hooks/useUpdateStudentProfile', () => ({
  useUpdateStudentProfile: hookMocks.useUpdateStudentProfile,
}))

const profile = mapStudentProfileResponse(createStudentProfileFixture())

function mockSuccessfulProfile() {
  const refetch = vi.fn().mockResolvedValue({ data: profile })
  const mutateAsync = vi
    .fn()
    .mockImplementation(async (values: StudentProfileFormValues) => ({ ...profile, ...values }))
  hookMocks.useStudentProfile.mockReturnValue({
    data: profile,
    error: null,
    isPending: false,
    isError: false,
    refetch,
  })
  hookMocks.useUpdateStudentProfile.mockReturnValue({
    isPending: false,
    mutateAsync,
  })
  return { mutateAsync, refetch }
}

describe('StudentProfilePage', () => {
  afterEach(() => vi.clearAllMocks())

  it('renders editable core fields and immutable identity as labelled values', () => {
    mockSuccessfulProfile()
    hookMocks.useStudentProfile.mockReturnValue({
      data: { ...profile, profilePhotoUrl: null },
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderWithProviders(<StudentProfilePage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByText(profile.indexNumber)).toBeInTheDocument()
    expect(screen.getByText(profile.universityEmail)).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeEnabled()
    expect(screen.getByLabelText('Professional Summary')).toBeEnabled()
    expect(screen.getByLabelText('Phone')).toBeEnabled()
    expect(screen.queryByRole('textbox', { name: 'Index Number' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'University Email' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /profile placeholder/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /upload|change|remove photo/i }),
    ).not.toBeInTheDocument()
  })

  it('submits only core editable values and reports server-confirmed success', async () => {
    const user = userEvent.setup()
    const { mutateAsync } = mockSuccessfulProfile()
    renderWithProviders(<StudentProfilePage />)

    const fullName = screen.getByLabelText('Full Name')
    await user.clear(fullName)
    await user.type(fullName, 'Committed Student')
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(mutateAsync).toHaveBeenCalledWith({
      fullName: 'Committed Student',
      summary: profile.summary,
      phone: profile.phone,
    })
    expect(await screen.findByText('Profile saved')).toBeInTheDocument()
  })

  it('maps approved backend field errors and focuses the invalid field', async () => {
    const user = userEvent.setup()
    mockSuccessfulProfile()
    const mutateAsync = vi.fn().mockRejectedValue({
      type: 'https://uor-cv-system/errors/validation-failed',
      title: 'Validation failed',
      status: 422,
      code: 'VALIDATION_FAILED',
      message: 'One or more fields are invalid.',
      correlationId: 'req-profile-422',
      fieldErrors: [
        { field: 'phone', code: 'INVALID_PHONE', message: 'Enter a valid phone number.' },
      ],
    })
    hookMocks.useUpdateStudentProfile.mockReturnValue({ isPending: false, mutateAsync })
    renderWithProviders(<StudentProfilePage />)

    const phone = screen.getByLabelText('Phone')
    await user.clear(phone)
    await user.type(phone, 'invalid')
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(await screen.findByText('Enter a valid phone number.')).toBeInTheDocument()
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(phone).toHaveFocus())
  })

  it('offers an explicit reload after a concurrent update conflict', async () => {
    const user = userEvent.setup()
    const { refetch } = mockSuccessfulProfile()
    hookMocks.useUpdateStudentProfile.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockRejectedValue({
        title: 'Precondition failed',
        status: 412,
        code: 'PRECONDITION_FAILED',
        message: 'The profile changed in another session.',
      }),
    })
    renderWithProviders(<StudentProfilePage />)

    await user.type(screen.getByLabelText('Phone'), '7')
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    const reload = await screen.findByRole('button', { name: 'Reload latest profile' })
    await user.click(reload)

    expect(refetch).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Reload latest profile' })).not.toBeInTheDocument()
  })

  it('shows the full loading skeleton and a retryable safe error state', async () => {
    const user = userEvent.setup()
    hookMocks.useStudentProfile.mockReturnValue({
      data: undefined,
      error: null,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    })
    hookMocks.useUpdateStudentProfile.mockReturnValue({ isPending: false, mutateAsync: vi.fn() })
    renderWithProviders(<StudentProfilePage />)

    expect(screen.getByRole('status', { name: 'Loading form content' })).toBeInTheDocument()

    cleanup()

    const refetch = vi.fn()
    hookMocks.useStudentProfile.mockReturnValue({
      data: undefined,
      error: { title: 'Unavailable', status: 503 },
      isPending: false,
      isError: true,
      refetch,
    })
    renderWithProviders(<StudentProfilePage />)

    expect(screen.getByRole('alert')).toHaveTextContent('temporarily unavailable')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledOnce()
  })
})
