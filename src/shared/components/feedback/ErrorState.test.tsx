import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('renders safe support context and a retry action', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()

    render(
      <ErrorState
        correlationId="req-profile-1"
        message="The profile could not be loaded."
        onAction={retry}
        title="Profile unavailable"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Reference: req-profile-1')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
