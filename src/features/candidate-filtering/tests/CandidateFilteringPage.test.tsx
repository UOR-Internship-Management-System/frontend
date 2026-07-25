import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { CandidateFilteringPage } from '../pages/CandidateFilteringPage'

function renderPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter initialEntries={['/admin/candidate-filtering']}>
          <CandidateFilteringPage />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('CandidateFilteringPage', () => {
  it('uses the approved page title and finalization terminology', () => {
    const previousTitle = document.title
    const view = renderPage()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Interactive Candidate Filtering Dashboard',
      }),
    ).toBeInTheDocument()
    expect(document.title).toBe(
      'Interactive Candidate Filtering Dashboard | Ruhuna CS CV Management System',
    )
    expect(screen.getByText(/manually finalize the shortlist/i)).toBeInTheDocument()

    view.unmount()
    expect(document.title).toBe(previousTitle)
  })
})
