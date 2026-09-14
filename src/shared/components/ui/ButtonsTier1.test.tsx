import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Button,
  IconButton,
  SegmentedButton,
  SplitButton,
  ButtonGroup,
  Fab,
  ExtendedFab,
  FabMenu,
} from './index'

describe('Tier 1: Buttons & Action Primitives', () => {
  describe('Button', () => {
    it('renders with default filled variant and preserves backward-compatible class names', () => {
      render(<Button>Submit</Button>)
      const button = screen.getByRole('button', { name: 'Submit' })
      expect(button).toBeInTheDocument()
      // Backward-compatible hook
      expect(button).toHaveClass('button')
      expect(button).toHaveClass('button-primary')
      // M3 Expressive hooks
      expect(button).toHaveClass('m3-button')
      expect(button).toHaveClass('m3-button--filled')
    })

    it('supports M3 Expressive variants: elevated, tonal, outlined, text, danger', () => {
      const { rerender } = render(<Button variant="elevated">Elevated</Button>)
      expect(screen.getByRole('button', { name: 'Elevated' })).toHaveClass('m3-button--elevated')

      rerender(<Button variant="tonal">Tonal</Button>)
      expect(screen.getByRole('button', { name: 'Tonal' })).toHaveClass('m3-button--tonal')

      rerender(<Button variant="outlined">Outlined</Button>)
      expect(screen.getByRole('button', { name: 'Outlined' })).toHaveClass('m3-button--outlined')

      rerender(<Button variant="text">Text</Button>)
      expect(screen.getByRole('button', { name: 'Text' })).toHaveClass('m3-button--text')

      rerender(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button', { name: 'Danger' })).toHaveClass('m3-button--danger')
    })

    it('supports 5 M3 sizing tiers', () => {
      const { rerender } = render(<Button size="xs">XS</Button>)
      expect(screen.getByRole('button', { name: 'XS' })).toHaveClass('m3-button--size-xs')

      rerender(<Button size="xl">XL</Button>)
      expect(screen.getByRole('button', { name: 'XL' })).toHaveClass('m3-button--size-xl')
    })

    it('renders loading state with accessible aria-busy and spinner', () => {
      render(<Button isLoading>Processing</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toBeDisabled()
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })
  })

  describe('IconButton', () => {
    it('renders accessible icon button with custom variants', async () => {
      const handleClick = vi.fn()
      render(
        <IconButton
          aria-label="Settings"
          variant="filled"
          icon={<span>⚙</span>}
          onClick={handleClick}
        />,
      )
      const btn = screen.getByRole('button', { name: 'Settings' })
      expect(btn).toHaveClass('m3-icon-button--filled')

      await userEvent.click(btn)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('SegmentedButton', () => {
    it('switches active pill and fires onChange', async () => {
      const handleChange = vi.fn()
      const options = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ]

      render(
        <SegmentedButton
          options={options}
          value="all"
          onChange={handleChange}
          ariaLabel="Filter status"
        />,
      )

      const activeBtn = screen.getByRole('button', { name: 'Active' })
      await userEvent.click(activeBtn)
      expect(handleChange).toHaveBeenCalledWith('active')
    })
  })

  describe('SplitButton', () => {
    it('triggers primary click and menu toggle separately', async () => {
      const handlePrimary = vi.fn()
      const handleToggle = vi.fn()

      render(
        <SplitButton
          onClick={handlePrimary}
          onToggleMenu={handleToggle}
          menuAriaLabel="More export options"
        >
          Export CSV
        </SplitButton>,
      )

      await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
      expect(handlePrimary).toHaveBeenCalledTimes(1)
      expect(handleToggle).not.toHaveBeenCalled()

      await userEvent.click(screen.getByRole('button', { name: 'More export options' }))
      expect(handleToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('ButtonGroup', () => {
    it('renders container with orientation and alignment classes', () => {
      render(
        <ButtonGroup align="end" spacing="compact">
          <Button>Cancel</Button>
          <Button variant="filled">Confirm</Button>
        </ButtonGroup>,
      )
      const group = screen.getByRole('group')
      expect(group).toHaveClass('m3-button-group--align-end')
      expect(group).toHaveClass('m3-button-group--compact')
    })
  })

  describe('Fab & ExtendedFab', () => {
    it('renders floating action buttons with proper aria labels and tags', () => {
      render(<Fab icon={<span>+</span>} aria-label="Add Student" size="large" />)
      const fab = screen.getByRole('button', { name: 'Add Student' })
      expect(fab).toHaveClass('m3-fab--size-large')

      render(<ExtendedFab label="New Project" icon={<span>🚀</span>} />)
      expect(screen.getByRole('button', { name: /New Project/i })).toBeInTheDocument()
    })
  })

  describe('FabMenu', () => {
    it('expands speed dial menu on trigger click', async () => {
      const handleAction = vi.fn()
      const items = [
        { id: '1', label: 'Import CSV', icon: <span>📄</span>, onClick: handleAction },
        { id: '2', label: 'Add Single', icon: <span>➕</span>, onClick: vi.fn() },
      ]

      render(
        <FabMenu
          icon={<span>☰</span>}
          aria-label="Actions menu"
          items={items}
        />,
      )

      expect(screen.queryByRole('menuitem', { name: /Import CSV/i })).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Actions menu' }))
      const menuItem = screen.getByRole('menuitem', { name: /Import CSV/i })
      expect(menuItem).toBeInTheDocument()

      await userEvent.click(menuItem)
      expect(handleAction).toHaveBeenCalledTimes(1)
    })
  })
})
