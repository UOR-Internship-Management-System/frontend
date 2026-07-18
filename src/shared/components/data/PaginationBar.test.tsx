import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PaginationBar } from './PaginationBar'

describe('PaginationBar', () => {
  it('renders nothing when the server reports no pages', () => {
    const { container } = render(
      <PaginationBar onPageChange={vi.fn()} page={0} size={5} totalElements={0} totalPages={0} />,
    )

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/Page 0 of 0/)).not.toBeInTheDocument()
  })

  it('preserves summaries and navigation for positive page counts', () => {
    const onPageChange = vi.fn()
    render(
      <PaginationBar
        label="Results pages"
        onPageChange={onPageChange}
        page={1}
        size={5}
        totalElements={12}
        totalPages={3}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Results pages' })).toBeVisible()
    expect(screen.getByText(/6–10 of 12/)).toBeVisible()
    expect(screen.getByText(/Page 2 of 3/)).toBeVisible()
  })
})
