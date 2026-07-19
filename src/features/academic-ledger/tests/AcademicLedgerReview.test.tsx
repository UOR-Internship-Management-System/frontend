import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { routePaths } from '../../../app/config/routePaths'
import { ledgerUploadId } from '../../../mocks/fixtures/academicLedger.fixture'
import { AcademicLedgerPage } from '../pages/AcademicLedgerPage'

function LocationProbe() {
  return <output data-testid="review-location">{useLocation().search}</output>
}

function renderReview(query = '') {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter
        initialEntries={[`${routePaths.adminAcademicLedger}?uploadId=${ledgerUploadId}${query}`]}
      >
        <Routes>
          <Route
            path={routePaths.adminAcademicLedger}
            element={
              <>
                <AcademicLedgerPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Academic Ledger staged review', () => {
  it('shows the validation gate, semantic staged-row table, and row diagnostics', async () => {
    renderReview()
    expect(
      await screen.findByText('All server validation checks passed.', {}, { timeout: 5_000 }),
    ).toBeInTheDocument()
    const table = await screen.findByRole(
      'table',
      { name: 'Staged academic ledger rows' },
      { timeout: 5_000 },
    )
    expect(within(table).getByText('2021CS001')).toBeInTheDocument()
    expect(within(table).getByText('Confirm the moderated grade.')).toBeInTheDocument()
    expect(within(table).getByText('Unmatched Student')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Staged academic ledger row pages' }),
    ).toBeInTheDocument()
  })

  it('persists staged-row search, filter, and sorting in the URL', async () => {
    const user = userEvent.setup()
    renderReview()
    await screen.findByRole('table', { name: 'Staged academic ledger rows' }, { timeout: 5_000 })
    await user.type(screen.getByLabelText('Search staged rows'), 'CS4020')
    await waitFor(
      () => expect(screen.getByTestId('review-location')).toHaveTextContent('rowSearch=CS4020'),
      { timeout: 2_000 },
    )
    await user.selectOptions(screen.getByLabelText('Validation status'), 'VALID')
    expect(screen.getByTestId('review-location')).toHaveTextContent('rowStatus=VALID')
    await user.selectOptions(screen.getByLabelText('Sort rows'), 'courseCode,asc')
    expect(screen.getByTestId('review-location')).toHaveTextContent('rowSort=courseCode%2Casc')
  }, 15_000)
})
