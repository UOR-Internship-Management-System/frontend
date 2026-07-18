import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
  currentFreshness,
  outdatedProfileFreshness,
  outdatedSkillsProjectsFreshness,
  savedCvVersion,
  setCvDownloadFailure,
  setCvExpireNextSave,
  setCvFreshnessFixture,
  setCvPreviewFailure,
  setCvVersionsFixture,
} from '../../../mocks/fixtures/cvBuilder.fixture'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../mocks/server'
import { CvBuilderPage } from '../pages/CvBuilderPage'

describe('CvBuilderPage', () => {
  it('renders the first-time state and keeps preview generation explicit', async () => {
    const view = renderWithProviders(<CvBuilderPage />)

    expect(await view.findByRole('heading', { level: 1, name: 'CV Builder' })).toBeVisible()
    expect(view.getByRole('heading', { name: 'No saved CV yet' })).toBeVisible()
    expect(view.getByRole('button', { name: 'Generate Preview' })).toBeEnabled()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
    expect(view.getByText('No saved versions')).toBeVisible()
    expect(view.queryByRole('navigation', { name: 'Saved CV version pages' })).toBeNull()
  })

  it('shows all five source groups with read-only Profile inclusion summaries', async () => {
    const view = renderWithProviders(<CvBuilderPage />)

    const experience = await view.findByRole('group', { name: 'Work Experience' })
    expect(experience).toHaveTextContent('Software Engineering Intern at Example Software')
    expect(within(experience).getByText('Included in CV')).toBeVisible()
    expect(
      within(experience).getByRole('link', { name: 'Manage Work Experience in Profile' }),
    ).toHaveAttribute('href', '/student/profile')

    expect(view.getByRole('group', { name: 'Projects to include' })).toBeVisible()
    expect(await view.findByText('AWS Cloud Foundations — Amazon Web Services')).toBeVisible()
    expect(view.getByText('Faculty Coding Challenge Winner — University of Ruhuna')).toBeVisible()
    expect(view.getByText('Computer Science Students Society — Committee Member')).toBeVisible()
    expect(view.getAllByRole('link', { name: /Manage .* in Profile/ })).toHaveLength(4)
  })

  it('keeps other CV controls usable when one Profile source group fails', async () => {
    server.use(
      http.get('/api/v1/me/profile/experience', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Experience is temporarily unavailable.',
            correlationId: 'cv-experience-503',
          },
          { status: 503 },
        ),
      ),
    )
    const view = renderWithProviders(<CvBuilderPage />)

    expect(
      await view.findByRole('heading', { name: 'Work Experience unavailable' }, { timeout: 3_000 }),
    ).toBeVisible()
    expect(await view.findByText('AWS Cloud Foundations — Amazon Web Services')).toBeVisible()
    expect(view.getByRole('button', { name: 'Generate Preview' })).toBeEnabled()
  })

  it('renders CURRENT and both typed OUTDATED source-area presentations', async () => {
    setCvFreshnessFixture(currentFreshness)
    const current = renderWithProviders(<CvBuilderPage />)
    expect(await current.findByRole('heading', { name: 'Your saved CV is current' })).toBeVisible()
    current.unmount()

    setCvFreshnessFixture(outdatedProfileFreshness)
    const profile = renderWithProviders(<CvBuilderPage />)
    expect(await profile.findByText(/Profile and CV details/)).toBeVisible()
    profile.unmount()

    setCvFreshnessFixture(outdatedSkillsProjectsFreshness)
    const sources = renderWithProviders(<CvBuilderPage />)
    expect(await sources.findByText(/Declared skills, Projects/)).toBeVisible()
  })

  it('generates, dirties, updates, and saves only the confirmed preview', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByRole('heading', { level: 1, name: 'CV Builder' })

    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    expect(await view.findByTitle('Generated CV visual preview')).toBeVisible()
    expect(view.getByText(/Sample Student/)).toBeVisible()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeEnabled()

    await user.click(view.getByRole('checkbox', { name: 'Awards' }))
    expect(view.getByRole('button', { name: 'Update Preview' })).toBeVisible()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
    expect(view.getByText(/controls changed after this preview/i)).toBeVisible()

    await user.click(view.getByRole('button', { name: 'Update Preview' }))
    await vi.waitFor(() =>
      expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeEnabled(),
    )
    await user.click(view.getByRole('button', { name: 'Save Current CV Version' }))
    expect(await view.findByText('CV version saved')).toBeVisible()
    expect(await view.findByText('Version 1')).toBeVisible()
  })

  it('preserves configuration and requires regeneration after a backend expiry conflict', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByRole('heading', { level: 1, name: 'CV Builder' })
    await user.click(view.getByRole('button', { name: 'Generate Preview' }))
    await view.findByTitle('Generated CV visual preview')
    setCvExpireNextSave(true)

    await user.click(view.getByRole('button', { name: 'Save Current CV Version' }))
    expect(await view.findByText('This preview has expired.')).toBeVisible()
    expect(view.getByRole('button', { name: 'Regenerate Preview' })).toBeEnabled()
    expect(view.getByRole('checkbox', { name: 'Skills' })).toBeChecked()
    expect(view.getByRole('button', { name: 'Save Current CV Version' })).toBeDisabled()
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
    expect(view.getByRole('button', { name: 'Try again' })).toBeEnabled()
  })

  it('renders populated history and starts a safe selected-version PDF download', async () => {
    setCvVersionsFixture([savedCvVersion])
    const createObjectURL = vi.fn().mockReturnValue('blob:cv-pdf')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)

    expect(await view.findByText('Version 4')).toBeVisible()
    await user.click(view.getByRole('button', { name: 'Download PDF' }))
    expect(await view.findByText('PDF download started')).toBeVisible()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:cv-pdf')
    expect(click).toHaveBeenCalledOnce()
  })

  it('guides a retry when a saved PDF is temporarily unavailable', async () => {
    setCvVersionsFixture([savedCvVersion])
    setCvDownloadFailure('unavailable')
    const user = userEvent.setup()
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByText('Version 4')

    await user.click(view.getByRole('button', { name: 'Download Latest PDF' }))
    expect(await view.findByText('PDF download failed')).toBeVisible()
    expect(view.getByText(/temporarily unavailable/i)).toBeVisible()
  })

  it('contains no removed workflow wording or unsupported download action', async () => {
    const view = renderWithProviders(<CvBuilderPage />)
    await view.findByRole('heading', { level: 1, name: 'CV Builder' })

    expect(view.queryByText(/Admin Review/i)).not.toBeInTheDocument()
    expect(view.queryByRole('button', { name: /download latex/i })).not.toBeInTheDocument()
  })
})
