import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  setAcademicRecordsFailure,
  setAcademicRecordsFixture,
  setGpaFailure,
  setGpaFixture,
  unavailableGpaFixture,
} from '../../../mocks/fixtures/academicRecords.fixture'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { AcademicRecordsPage } from '../pages/AcademicRecordsPage'

describe('AcademicRecordsPage', () => {
  it('shows official AVAILABLE GPA and populated committed records', async () => {
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByRole('heading', { level: 1, name: 'Academic Records' })).toBeVisible()
    expect(await view.findByText('3.75')).toBeVisible()
    expect(view.getByText('Official')).toBeVisible()
    expect(await view.findByText('Distributed Systems')).toBeVisible()
    expect(view.getByText(/12 records from official server metadata/i)).toBeVisible()
  })

  it('treats NOT_AVAILABLE as a successful official GPA state', async () => {
    setGpaFixture(unavailableGpaFixture)
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(
      await view.findByRole('heading', { name: 'Official GPA is not available yet' }),
    ).toBeVisible()
    expect(view.getByText('Not available')).toBeVisible()
    expect(view.queryByText('3.75')).not.toBeInTheDocument()
  })

  it('distinguishes an empty committed record set from a search with no results', async () => {
    setAcademicRecordsFixture([])
    const empty = renderWithProviders(<AcademicRecordsPage />)
    expect(await empty.findByText('No committed records yet')).toBeVisible()
    empty.unmount()

    const user = userEvent.setup()
    const searched = renderWithProviders(<AcademicRecordsPage />)
    await user.type(searched.getByRole('searchbox', { name: 'Search academic records' }), 'quantum')
    expect(await searched.findByText('No matching records')).toBeVisible()
    expect(searched.getByText(/No committed records match "quantum"/)).toBeVisible()
  })

  it('uses server pagination metadata to move between record pages', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByText(/1.10 of 12/)).toBeVisible()
    await user.click(view.getByRole('button', { name: 'Next' }))
    expect(await view.findByText('Legacy Systems')).toBeVisible()
    expect(view.getByText(/11.12 of 12/)).toBeVisible()
  })

  it('sends only an authorized sort value and renders the sorted page', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<AcademicRecordsPage />)
    await view.findByText('Distributed Systems')

    await user.selectOptions(
      view.getByRole('combobox', { name: 'Sort academic records' }),
      'courseCode,desc',
    )
    const table = await view.findByRole('table')
    const firstDataRow = within(table).getAllByRole('row')[1]
    expect(within(firstDataRow).getByText('CS4060')).toBeVisible()
  })

  it('keeps GPA failure and retry independent from loaded records', async () => {
    setGpaFailure('unauthorized')
    const user = userEvent.setup()
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByRole('heading', { name: 'Official GPA unavailable' })).toBeVisible()
    expect(view.getByText(/session has expired/i)).toBeVisible()
    expect(await view.findByText('Distributed Systems')).toBeVisible()

    setGpaFailure(null)
    await user.click(view.getByRole('button', { name: 'Try again' }))
    expect(await view.findByText('3.75')).toBeVisible()
  })

  it('keeps records failure and retry independent from loaded GPA', async () => {
    setAcademicRecordsFailure('unauthorized')
    const user = userEvent.setup()
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByRole('heading', { name: 'Academic records unavailable' })).toBeVisible()
    expect(view.getByText('3.75')).toBeVisible()

    setAcademicRecordsFailure(null)
    await user.click(view.getByRole('button', { name: 'Try again' }))
    expect(await view.findByText('Distributed Systems')).toBeVisible()
  })

  it('presents independent service-unavailable states after safe GET retries', async () => {
    setGpaFailure('service-unavailable')
    setAcademicRecordsFailure('service-unavailable')
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(
      await view.findByRole('heading', { name: 'Official GPA unavailable' }, { timeout: 4_000 }),
    ).toBeVisible()
    expect(view.getByRole('heading', { name: 'Academic records unavailable' })).toBeVisible()
    expect(view.getAllByText(/temporarily unavailable/i)).toHaveLength(2)
  })

  it('contains no academic edit controls or unsupported GPA behavior', async () => {
    const view = renderWithProviders(<AcademicRecordsPage />)
    await view.findByText('Distributed Systems')

    expect(view.getByText(/This table is read-only/i, { selector: 'caption' })).toBeInTheDocument()
    expect(view.queryByRole('button', { name: /edit|add|delete|save/i })).not.toBeInTheDocument()
    expect(view.queryByText(/Estimated GPA/i)).not.toBeInTheDocument()
    expect(view.queryByRole('columnheader', { name: /actions/i })).not.toBeInTheDocument()
  })
})
