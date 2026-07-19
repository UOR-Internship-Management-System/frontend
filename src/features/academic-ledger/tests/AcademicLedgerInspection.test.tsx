import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { routePaths } from '../../../app/config/routePaths'
import { AcademicLedgerPage } from '../pages/AcademicLedgerPage'

function renderPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[routePaths.adminAcademicLedger]}>
        <AcademicLedgerPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Academic Ledger read-only inspection', () => {
  it('searches the Student directory and opens official records in an accessible modal', async () => {
    const user = userEvent.setup()
    renderPage()
    const studentTable = await screen.findByRole('table', {
      name: 'Students available for official academic record inspection',
    })
    expect(within(studentTable).getByText('Not available')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Search Students for academic inspection'))
    await user.type(screen.getByLabelText('Search Students for academic inspection'), 'Lahiru')
    await waitFor(
      () =>
        expect(
          within(studentTable).getAllByRole('button', { name: 'View academic records' }),
        ).toHaveLength(1),
      { timeout: 2_000 },
    )
    expect(within(studentTable).getByText('Lahiru Gunasekara')).toBeInTheDocument()
    await user.click(within(studentTable).getByRole('button', { name: 'View academic records' }))
    const dialog = await screen.findByRole('dialog', {
      name: /Lahiru Gunasekara's academic records/i,
    })
    expect(
      within(dialog).getByRole('table', {
        name: /Official academic records for Lahiru Gunasekara/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', { name: /edit|save|delete/i }),
    ).not.toBeInTheDocument()
  })

  it('supports course controls and restores focus when the record modal closes', async () => {
    const user = userEvent.setup()
    renderPage()
    const openButtons = await screen.findAllByRole('button', { name: 'View academic records' })
    const trigger = openButtons[0]
    await user.click(trigger)
    const dialog = await screen.findByRole('dialog')
    const courseInput = within(dialog).getByLabelText('Filter by course code')
    await user.type(courseInput, 'CS4010')
    await waitFor(() => expect(within(dialog).getByText('Distributed Systems')).toBeInTheDocument())
    await user.click(within(dialog).getByRole('button', { name: /Close .* academic records/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
