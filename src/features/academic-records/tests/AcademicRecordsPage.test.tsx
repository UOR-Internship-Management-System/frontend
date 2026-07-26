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
  it('matches the approved GPA card and five-column official-results structure', async () => {
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByRole('heading', { level: 1, name: 'Academic Records' })).toBeVisible()
    expect(await view.findByText('Computer Science GPA')).toBeVisible()
    expect(await view.findByText('3.75')).toBeVisible()
    expect(await view.findByText('Distributed Systems')).toBeVisible()

    const table = view.getByRole('table')
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5)
    expect(within(table).getByRole('columnheader', { name: 'Subject Code' })).toBeVisible()
    expect(within(table).getByRole('columnheader', { name: 'Subject Name' })).toBeVisible()
    expect(within(table).getByRole('columnheader', { name: 'Credits' })).toBeVisible()
    expect(within(table).getByRole('columnheader', { name: 'Grade' })).toBeVisible()
    expect(within(table).getByRole('columnheader', { name: 'Grade Point' })).toBeVisible()

    const distributedSystemsRow = within(table).getByRole('row', { name: /Distributed Systems/ })
    expect(within(distributedSystemsRow).getByRole('cell', { name: 'CS4010' })).toBeVisible()
    expect(
      within(distributedSystemsRow).getByRole('cell', { name: 'Distributed Systems' }),
    ).toBeVisible()
  })

  it('treats NOT_AVAILABLE as a successful official GPA state', async () => {
    setGpaFixture(unavailableGpaFixture)
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByText('Not available')).toBeVisible()
    expect(view.getByText(/after official academic results are committed/i)).toBeVisible()
    expect(view.queryByText('3.75')).not.toBeInTheDocument()
  })

  it('distinguishes an empty official record set from a search with no results', async () => {
    setAcademicRecordsFixture([])
    const empty = renderWithProviders(<AcademicRecordsPage />)
    expect(await empty.findByText('No academic records yet')).toBeVisible()
    empty.unmount()

    const user = userEvent.setup()
    const searched = renderWithProviders(<AcademicRecordsPage />)
    await user.type(searched.getByRole('searchbox', { name: 'Search academic records' }), 'quantum')
    expect(
      await searched.findByText('No matching records', undefined, { timeout: 3_000 }),
    ).toBeVisible()
    expect(searched.getByText(/No official results match "quantum"/)).toBeVisible()
  })

  it('uses five-row server pagination to mirror the approved page layout', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<AcademicRecordsPage />)

    expect(await view.findByText(/1.5 of 12/)).toBeVisible()
    await user.click(view.getByRole('button', { name: 'Next' }))
    expect(await view.findByText('Human Computer Interaction')).toBeVisible()
    expect(view.getByText(/6.10 of 12/)).toBeVisible()
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

  it('contains no edit, sort, Estimated GPA, or unsupported detail controls', async () => {
    const view = renderWithProviders(<AcademicRecordsPage />)
    await view.findByText('Distributed Systems')

    expect(view.getByText(/This table is read-only/i, { selector: 'caption' })).toBeInTheDocument()
    expect(view.queryByRole('button', { name: /edit|add|delete|save/i })).not.toBeInTheDocument()
    expect(view.queryByRole('combobox', { name: /sort academic records/i })).not.toBeInTheDocument()
    expect(view.queryByText(/Estimated GPA/i)).not.toBeInTheDocument()
    expect(
      view.queryByRole('columnheader', { name: /academic period|attempt|result|committed/i }),
    ).not.toBeInTheDocument()
    expect(view.queryByRole('columnheader', { name: /actions/i })).not.toBeInTheDocument()
  })
})
