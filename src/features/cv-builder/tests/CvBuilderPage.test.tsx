import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
  currentFreshness,
  outdatedProfileFreshness,
  savedCv,
  setCvDownloadFailure,
  setCvExpireNextSave,
  setCvFixture,
  setCvFreshnessFixture,
  setCvPreviewFailure,
} from '../../../mocks/fixtures/cvBuilder.fixture'
import { MemoryRouter } from 'react-router-dom'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../mocks/server'
import { CvBuilderPage } from '../pages/CvBuilderPage'

describe('CvBuilderPage', () => {
  it('renders the LaTeX CV Builder first-time state without source exposure or history UI', async () => {
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    expect(await view.findByRole('heading', { level: 1, name: 'LaTeX CV Builder' })).toBeVisible()
    expect(view.getByRole('button', { name: 'Generate Preview' })).toBeEnabled()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
    expect(view.queryByText('Included sections and order')).not.toBeInTheDocument()
    expect(view.queryByText('LaTeX Output')).not.toBeInTheDocument()
    expect(view.queryByText('Saved CV Versions')).not.toBeInTheDocument()
    expect(view.getByText('Identity and contact details')).toBeVisible()
    expect(view.getByText('Declared skills')).toBeVisible()
    expect(view.getByText(/LaTeX source private/)).toBeVisible()
    expect(view.getAllByText('No saved CV yet')[0]).toBeVisible()
  })

  it('shows item-level checkboxes in five fixed groups without master toggles', async () => {
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    const experience = await view.findByRole('group', { name: 'Work Experience' })
    expect(
      within(experience).getByRole('checkbox', { name: /Software Engineering Intern/ }),
    ).toBeChecked()
    expect(within(experience).queryByRole('checkbox', { name: 'Work Experience' })).toBeNull()
    expect(view.getByRole('checkbox', { name: 'Accessible Internship Portal' })).toBeChecked()
    expect(view.getByRole('checkbox', { name: /AWS Cloud Foundations/ })).toBeChecked()
    expect(view.getByRole('checkbox', { name: /Faculty Coding Challenge Winner/ })).toBeChecked()
    expect(view.getByRole('checkbox', { name: /Computer Science Students Society/ })).toBeChecked()
  })

  it('keeps other controls usable when one Profile source group fails', async () => {
    server.use(
      http.get('/api/v1/me/profile/experience', () =>
        HttpResponse.json(
          { status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Experience is unavailable.' },
          { status: 503 },
        ),
      ),
    )
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    expect(
      await view.findByRole('heading', { name: 'Work Experience unavailable' }, { timeout: 5_000 }),
    ).toBeVisible()
    expect(view.getByRole('button', { name: 'Generate Preview' })).toBeDisabled()
  })

  it('renders current and outdated freshness states', async () => {
    setCvFixture(savedCv)
    setCvFreshnessFixture(currentFreshness)
    const current = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    expect(await current.findByRole('heading', { name: 'Your saved CV is current' })).toBeVisible()
    expect(await current.findByText('student-cv.pdf')).toBeVisible()
    expect(current.getByText('180.0 KB')).toBeVisible()
    current.unmount()
    setCvFreshnessFixture(outdatedProfileFreshness)
    const outdated = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    expect(await outdated.findByText(/Profile and CV details/)).toBeVisible()
  })

  it('generates, dirties, updates, and saves only the confirmed preview', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    await view.findByRole('heading', { level: 1, name: 'LaTeX CV Builder' })
    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    expect(await view.findByTitle('Generated CV visual preview')).toBeVisible()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeEnabled()

    await user.click(view.getByRole('checkbox', { name: /Faculty Coding Challenge Winner/ }))
    expect(view.getByRole('button', { name: 'Update Preview' })).toBeVisible()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
    await user.click(view.getByRole('button', { name: 'Update Preview' }))
    await vi.waitFor(() =>
      expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeEnabled(),
    )
    await user.click(view.getByRole('button', { name: 'Save Current CV Version' }))
    expect(await view.findByText('CV saved')).toBeVisible()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
    expect(view.getByRole('button', { name: 'Download Current CV PDF' })).toBeEnabled()
    expect(
      view.getByText('The displayed preview is saved as the current CV version.'),
    ).toBeVisible()
  })

  it('keeps a completed preview stale when selections change during generation', async () => {
    server.use(
      http.post('/api/v1/me/cv/preview', async ({ request }) => {
        await delay(500)
        const configuration = await request.json()
        return HttpResponse.json({
          previewId: '70000000-0000-4000-8000-000000000099',
          htmlPreview: '<article><h1>Delayed preview</h1></article>',
          freshness: {
            status: 'NOT_SAVED',
            changedAreas: [],
            cvId: null,
            savedAt: null,
            evaluatedAt: '2026-07-21T08:00:00Z',
            message: 'No saved CV exists yet.',
          },
          configuration,
          generatedAt: '2026-07-21T08:00:00Z',
          expiresAt: '2099-07-21T08:15:00Z',
        })
      }),
    )
    const user = userEvent.setup()
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    await view.findByRole('heading', { level: 1, name: 'LaTeX CV Builder' })

    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    await user.click(view.getByRole('checkbox', { name: /Faculty Coding Challenge Winner/ }))

    expect(await view.findByTitle('Generated CV visual preview')).toBeVisible()
    expect(view.getByText(/selections changed while the preview was generating/i)).toBeVisible()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
  })

  it('retains configuration and requires regeneration after expiry', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    await view.findByRole('heading', { level: 1, name: 'LaTeX CV Builder' })
    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    await view.findByTitle('Generated CV visual preview')
    setCvExpireNextSave(true)
    await user.click(view.getByRole('button', { name: 'Save Current CV Version' }))
    expect(await view.findByText('This preview has expired.')).toBeVisible()
    expect(view.getByRole('checkbox', { name: 'Accessible Internship Portal' })).toBeChecked()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
  })

  it.each([
    ['validation' as const, 'Review the selected CV records.'],
    ['generation' as const, 'The service is temporarily unavailable. Please try again.'],
  ])('shows a safe retryable %s preview error', async (failure, message) => {
    setCvPreviewFailure(failure)
    const user = userEvent.setup()
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    await view.findByRole('heading', { level: 1, name: 'LaTeX CV Builder' })
    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    expect(await view.findByRole('heading', { name: 'Preview generation failed' })).toBeVisible()
    expect(view.getByText(message)).toBeVisible()
  })

  it('downloads only the active saved PDF', async () => {
    setCvFixture(savedCv)
    setCvFreshnessFixture(currentFreshness)
    const createObjectURL = vi.fn().mockReturnValue('blob:cv-pdf')
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const user = userEvent.setup()
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    await user.click(await view.findByRole('button', { name: 'Download Current CV PDF' }))
    expect(await view.findByText('PDF download started')).toBeVisible()
    expect(createObjectURL).toHaveBeenCalledOnce()
  })

  it('guides a retry when the saved PDF is temporarily unavailable', async () => {
    setCvFixture(savedCv)
    setCvFreshnessFixture(currentFreshness)
    setCvDownloadFailure('unavailable')
    const user = userEvent.setup()
    const view = renderWithProviders(
      <MemoryRouter>
        <CvBuilderPage />
      </MemoryRouter>,
    )
    await user.click(await view.findByRole('button', { name: 'Download Current CV PDF' }))
    expect(await view.findByText('PDF download failed')).toBeVisible()
  })
})
