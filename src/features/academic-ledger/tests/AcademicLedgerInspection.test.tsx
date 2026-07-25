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
  it(
    'searches the Student directory and opens official records in an accessible modal',
    async () => {
      const user = userEvent.setup()
      renderPage()
      const studentTable = await screen.findByRole('table', {
        name: 'Students available for official academic record inspection',
      })
      expect(within(studentTable).getByText('Not available')).toBeInTheDocument()

      const search = screen.getByLabelText('Search Students by name or index number')
      await user.type(search, 'Lahiru')
      await waitFor(
        () =>
          expect(
            within(studentTable).getAllByRole('button', { name: 'View More' }),
          ).toHaveLength(1),
        { timeout: 5_000 },
      )

      expect(within(studentTable).getByText('Lahiru Gunasekara')).toBeInTheDocument()
      await user.click(within(studentTable).getByRole('button', { name: 'View More' }))

      const dialog = await screen.findByRole('dialog', {
        name: 'Student Academic Records Detailed View',
      })
      expect(
        within(dialog).getByRole('table', {
          name: /Official academic records for Lahiru Gunasekara/i,
        }),
      ).toBeInTheDocument()
      expect(
        within(dialog).queryByRole('button', { name: /edit|save|delete/i }),
      ).not.toBeInTheDocument()
    },
    15_000,
  )

  it('supports subject search and filtering and restores focus when the modal closes', async () => {
    const user = userEvent.setup()
    renderPage()
    const openButtons = await screen.findAllByRole('button', { name: 'View More' })
    const trigger = openButtons[0]
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog', {
      name: 'Student Academic Records Detailed View',
    })
    await user.type(within(dialog).getByLabelText('Search Subject'), 'Distributed')
    await waitFor(() =>
      expect(within(dialog).getByText('Distributed Systems')).toBeInTheDocument(),
    )

    await user.clear(within(dialog).getByLabelText('Search Subject'))
    await user.selectOptions(within(dialog).getByLabelText('Filter by Subject'), 'CS4010')
    await waitFor(() =>
      expect(within(dialog).getByText('Distributed Systems')).toBeInTheDocument(),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Close Student Academic Records Detailed View',
      }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  }, 15_000)
})
