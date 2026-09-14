import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  LinearProgress,
  CircularProgress,
  LoadingIndicator,
  Snackbar,
} from './index'
import { Badge, BadgeAnchor, Chip, StatusBadge } from '../ui'
import { Tooltip } from '../overlays/Tooltip'

describe('Tier 4: Communication, Tags & Feedback', () => {
  describe('Badge & BadgeAnchor', () => {
    it('renders numeric badge and respects maxCount', () => {
      render(
        <BadgeAnchor badge={<Badge count={120} maxCount={99} />}>
          <button type="button">Inbox</button>
        </BadgeAnchor>,
      )

      expect(screen.getByText('99+')).toBeInTheDocument()
      expect(screen.getByLabelText('120 notifications')).toBeInTheDocument()
    })

    it('renders dot badge for compact notification alerts', () => {
      render(<Badge dot />)
      expect(screen.getByLabelText('New notification')).toHaveClass('m3-badge--dot')
    })
  })

  describe('Chip & StatusBadge', () => {
    it('renders filter chip with toggle checkmark', async () => {
      const handleClick = vi.fn()
      const { rerender } = render(
        <Chip variant="filter" selected={false} onClick={handleClick}>
          TypeScript
        </Chip>,
      )

      const chip = screen.getByRole('button', { name: 'TypeScript' })
      expect(chip).toHaveAttribute('aria-pressed', 'false')
      expect(screen.queryByText('check')).not.toBeInTheDocument()

      rerender(
        <Chip variant="filter" selected={true} onClick={handleClick}>
          TypeScript
        </Chip>,
      )

      expect(chip).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('check')).toBeInTheDocument()
    })

    it('renders input chip with remove trigger', async () => {
      const handleRemove = vi.fn()
      render(
        <Chip variant="input" onRemove={handleRemove}>
          React.js
        </Chip>,
      )

      const removeBtn = screen.getByRole('button', { name: 'Remove' })
      await userEvent.click(removeBtn)
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })

    it('renders StatusBadge with approved tonal classes and legacy support', () => {
      const { rerender } = render(<StatusBadge tone="success">Verified</StatusBadge>)
      expect(screen.getByText('Verified')).toHaveClass('status-success')

      rerender(<StatusBadge tone="danger">Rejected</StatusBadge>)
      expect(screen.getByText('Rejected')).toHaveClass('status-danger')

      rerender(<StatusBadge tone="warning">Under Review</StatusBadge>)
      expect(screen.getByText('Under Review')).toHaveClass('status-warning')
    })
  })

  describe('Progress Indicators', () => {
    it('renders LinearProgress with value and indeterminate state', () => {
      const { rerender } = render(<LinearProgress value={65} ariaLabel="Upload progress" />)
      const progressBar = screen.getByRole('progressbar', { name: 'Upload progress' })
      expect(progressBar).toHaveAttribute('aria-valuenow', '65')

      rerender(<LinearProgress ariaLabel="Loading files" />)
      expect(progressBar).toHaveClass('m3-progress-linear--indeterminate')
      expect(progressBar).not.toHaveAttribute('aria-valuenow')
    })

    it('renders CircularProgress with indeterminate spinner animation', () => {
      render(<CircularProgress ariaLabel="Syncing records" />)
      const spinner = screen.getByRole('progressbar', { name: 'Syncing records' })
      expect(spinner).toHaveClass('m3-progress-circular--indeterminate')
    })
  })

  describe('LoadingIndicator', () => {
    it('renders expressive organic shape-morph loading indicator', () => {
      render(<LoadingIndicator ariaLabel="Preparing preview" />)
      expect(screen.getByRole('status')).toHaveClass('m3-loading-morph')
      expect(screen.getByText('Preparing preview')).toBeInTheDocument()
    })
  })

  describe('Snackbar', () => {
    it('renders message, action button, and dismiss trigger', async () => {
      const handleAction = vi.fn()
      const handleClose = vi.fn()

      render(
        <Snackbar
          message="CV Saved Successfully"
          actionLabel="View"
          onAction={handleAction}
          onClose={handleClose}
        />,
      )

      expect(screen.getByText('CV Saved Successfully')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'View' }))
      expect(handleAction).toHaveBeenCalledTimes(1)

      await userEvent.click(screen.getByRole('button', { name: 'Close alert' }))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tooltip', () => {
    it('shows floating tooltip bubble on hover and preserves title attribute', async () => {
      render(
        <Tooltip label="Download PDF">
          <button type="button">Download</button>
        </Tooltip>,
      )

      const trigger = screen.getByText('Download').parentElement!
      expect(trigger).toHaveAttribute('title', 'Download PDF')

      await userEvent.hover(trigger)
      expect(screen.getByRole('tooltip')).toHaveTextContent('Download PDF')

      await userEvent.unhover(trigger)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })
})
