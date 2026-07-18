import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
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
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../mocks/server'
import { CvBuilderPage } from '../pages/CvBuilderPage'

describe('CvBuilderPage', () => {
  it('renders the single-CV first-time state without order, LaTeX, or history UI', async () => {
    const view = renderWithProviders(<CvBuilderPage />)
    expect(await view.findByRole('heading', { level: 1, name: 'CV Builder' })).toBeVisible()
    expect(view.getByRole('button', { name: 'Generate Preview' })).toBeEnabled()
    expect(view.getByRole('button', { name: 'Save CV' })).toBeDisabled()
    expect(view.queryByText('Included sections and order')).not.toBeInTheDocument()
    expect(view.queryByText('LaTeX Output')).not.toBeInTheDocument()
    expect(view.queryByText('Saved CV Versions')).not.toBeInTheDocument()
  })

  it('shows all five section toggles and read-only source summaries', async () => {
    const view = renderWithProviders(<CvBuilderPage />)
    const experience = await view.findByRole('group', { name: 'Work Experience' })
    expect(within(experience).getByRole('checkbox', { name: 'Work Experience' })).toBeChecked()
    expect(experience).toHaveTextContent('Software Engineering Intern at Example Software')
    expect(view.getByRole('checkbox', { name: 'Projects' })).toBeChecked()
    expect(view.getByRole('checkbox', { name: 'Certificates' })).toBeChecked()
    expect(view.getByRole('checkbox', { name: 'Awards and Honors' })).toBeChecked()
    expect(view.getByRole('checkbox', { name: 'Extracurricular Activities' })).toBeChecked()
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
    const view = renderWithProviders(<CvBuilderPage />)
    expect(
      await view.findByRole('heading', { name: 'Work Experience unavailable' }, { timeout: 5_000 }),
    ).toBeVisible()
    expect(view.getByRole('button', { name: 'Generate Preview' })).toBeEnabled()
  })

  it('renders current and outdated freshness states', async () => {
    setCvFixture(savedCv)
    setCvFreshnessFixture(currentFreshness)
    const current = renderWithProviders(<CvBuilderPage />)
    expect(await current.findByRole('heading', { name: 'Your saved CV is current' })).toBeVisible()
    current.unmount()
    setCvFreshnessFixture(outdatedProfileFreshness)
    const outdated = renderWithProviders(<CvBuilderPage />)
    expect(await outdated.findByText(/Profile and CV details/)).toBeVisible()
  })

  it('generates, dirties, updates, and saves only the confirmed preview', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByRole('heading', { level: 1, name: 'CV Builder' })
    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    expect(await view.findByTitle('Generated CV visual preview')).toBeVisible()
    expect(view.getByRole('button', { name: 'Save CV' })).toBeEnabled()

    await user.click(view.getByRole('checkbox', { name: 'Awards and Honors' }))
    expect(view.getByRole('button', { name: 'Update Preview' })).toBeVisible()
    expect(view.getByRole('button', { name: 'Save CV' })).toBeDisabled()
    await user.click(view.getByRole('button', { name: 'Update Preview' }))
    await vi.waitFor(() => expect(view.getByRole('button', { name: 'Save CV' })).toBeEnabled())
    await user.click(view.getByRole('button', { name: 'Save CV' }))
    expect(await view.findByText('CV saved')).toBeVisible()
    expect(view.getByRole('button', { name: 'Update Saved CV' })).toBeEnabled()
    expect(view.getByRole('button', { name: 'Download Saved PDF' })).toBeEnabled()
  })

  it('retains configuration and requires regeneration after expiry', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByRole('heading', { level: 1, name: 'CV Builder' })
    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    await view.findByTitle('Generated CV visual preview')
    setCvExpireNextSave(true)
    await user.click(view.getByRole('button', { name: 'Save CV' }))
    expect(await view.findByText('This preview has expired.')).toBeVisible()
    expect(view.getByRole('checkbox', { name: 'Projects' })).toBeChecked()
    expect(view.getByRole('button', { name: 'Save CV' })).toBeDisabled()
  })

  it.each([
    ['validation' as const, 'Review the selected CV sections and projects.'],
    ['generation' as const, 'The service is temporarily unavailable. Please try again.'],
  ])('shows a safe retryable %s preview error', async (failure, message) => {
    setCvPreviewFailure(failure)
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByRole('heading', { level: 1, name: 'CV Builder' })
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
    const view = renderWithProviders(<CvBuilderPage />)
    await user.click(await view.findByRole('button', { name: 'Download Saved PDF' }))
    expect(await view.findByText('PDF download started')).toBeVisible()
    expect(createObjectURL).toHaveBeenCalledOnce()
  })

  it('guides a retry when the saved PDF is temporarily unavailable', async () => {
    setCvFixture(savedCv)
    setCvFreshnessFixture(currentFreshness)
    setCvDownloadFailure('unavailable')
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await user.click(await view.findByRole('button', { name: 'Download Saved PDF' }))
    expect(await view.findByText('PDF download failed')).toBeVisible()
  })
})
