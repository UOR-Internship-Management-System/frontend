import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogIcon,
  Menu,
  MenuItem,
  MenuDivider,
  BottomSheet,
  SideSheet,
  Modal,
} from './index'

describe('Tier 6: Overlays, Dialogs & Sheets', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.style.overflow = ''
  })

  describe('Dialog (M3 Expressive)', () => {
    it('renders with title, description, and actions', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onConfirm = vi.fn()

      render(
        <Dialog
          isOpen={true}
          onClose={onClose}
          title="Delete Candidate"
          description="Are you sure you want to delete this record?"
          size="medium"
          actions={
            <>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="button" onClick={onConfirm}>
                Confirm
              </button>
            </>
          }
        >
          <p>This action is irreversible.</p>
        </Dialog>,
      )

      const dialog = screen.getByRole('dialog', { name: 'Delete Candidate' })
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveClass('m3-dialog', 'm3-dialog--medium')
      expect(screen.getByText('Are you sure you want to delete this record?')).toBeInTheDocument()
      expect(screen.getByText('This action is irreversible.')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Confirm' }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('supports compound subcomponents (DialogTitle, DialogContent, DialogActions, DialogIcon)', () => {
      render(
        <Dialog isOpen={true} size="large" aria-label="Compound Dialog">
          <DialogIcon data-testid="test-icon">
            <span>warning</span>
          </DialogIcon>
          <DialogTitle>Reset System Config</DialogTitle>
          <DialogContent>
            <p>Compound body content</p>
          </DialogContent>
          <DialogActions>
            <button type="button">Action 1</button>
          </DialogActions>
        </Dialog>,
      )

      const dialog = screen.getByRole('dialog', { name: 'Compound Dialog' })
      expect(dialog).toHaveClass('m3-dialog--large')
      expect(screen.getByTestId('test-icon')).toHaveClass('m3-dialog__icon')
      expect(screen.getByText('Reset System Config')).toHaveClass('m3-dialog__headline')
      expect(screen.getByText('Compound body content')).toBeInTheDocument()
    })

    it('dismisses when clicking backdrop scrim if closeOnBackdrop is true', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <Dialog isOpen={true} onClose={onClose} closeOnBackdrop={true} title="Test Dialog">
          <p>Dialog body</p>
        </Dialog>,
      )

      const scrim = screen.getByTestId('m3-dialog-scrim')
      await user.click(scrim)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('dismisses when pressing Escape', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <Dialog isOpen={true} onClose={onClose} title="Escape Test">
          <button type="button">Focused button</button>
        </Dialog>,
      )

      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('isolates the app, restores focus, and marks adaptive dialogs for compact screens', async () => {
      const user = userEvent.setup()
      const appRoot = document.createElement('div')
      appRoot.id = 'root'
      document.body.appendChild(appRoot)

      function Harness() {
        const [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button onClick={() => setIsOpen(true)} type="button">
              Add education
            </button>
            <Dialog
              adaptiveFullscreen
              closeOnBackdrop={false}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              size="large"
              title="Add education"
            >
              <input aria-label="Degree" />
            </Dialog>
          </>
        )
      }

      render(<Harness />, { container: appRoot })
      const trigger = screen.getByRole('button', { name: 'Add education' })
      await user.click(trigger)

      const dialog = screen.getByRole('dialog', { name: 'Add education' })
      expect(dialog).toHaveClass('m3-dialog--adaptive-fullscreen')
      expect(appRoot).toHaveAttribute('aria-hidden', 'true')
      expect(appRoot).toHaveAttribute('inert')

      await user.click(screen.getByRole('button', { name: 'Close Add education' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(appRoot).not.toHaveAttribute('aria-hidden')
      expect(appRoot).not.toHaveAttribute('inert')
      expect(trigger).toHaveFocus()

      appRoot.remove()
    })
  })

  describe('Menu & MenuItem (M3 Expressive)', () => {
    it('renders menu items with icons, shortcuts, and handles click', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      render(
        <Menu isOpen={true} aria-label="Actions Menu">
          <MenuItem icon={<span>edit</span>} onClick={onSelect} trailingText="Ctrl+E">
            Edit Document
          </MenuItem>
          <MenuItem selected>Current Selection</MenuItem>
          <MenuDivider />
          <MenuItem destructive>Delete</MenuItem>
          <MenuItem disabled>Unavailable Action</MenuItem>
        </Menu>,
      )

      const menu = screen.getByRole('menu', { name: 'Actions Menu' })
      expect(menu).toHaveClass('m3-menu')

      const editItem = screen.getByRole('menuitem', { name: /Edit Document/i })
      expect(screen.getByText('Ctrl+E')).toBeInTheDocument()
      await user.click(editItem)
      expect(onSelect).toHaveBeenCalledTimes(1)

      const selectedItem = screen.getByRole('menuitem', { name: /Current Selection/i })
      expect(selectedItem).toHaveClass('m3-menu-item--selected')

      const destructiveItem = screen.getByRole('menuitem', { name: /Delete/i })
      expect(destructiveItem).toHaveClass('m3-menu-item--destructive')

      const disabledItem = screen.getByRole('menuitem', { name: /Unavailable Action/i })
      expect(disabledItem).toBeDisabled()

      expect(screen.getByRole('separator')).toHaveClass('m3-menu-divider')
    })

    it('navigates through items with Arrow keys and Escape closes menu', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <Menu isOpen={true} onClose={onClose}>
          <MenuItem>First Item</MenuItem>
          <MenuItem>Second Item</MenuItem>
          <MenuItem>Third Item</MenuItem>
        </Menu>,
      )

      const first = screen.getByRole('menuitem', { name: 'First Item' })
      const second = screen.getByRole('menuitem', { name: 'Second Item' })
      const third = screen.getByRole('menuitem', { name: 'Third Item' })

      first.focus()
      expect(first).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(second).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(third).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(second).toHaveFocus()

      await user.keyboard('{Home}')
      expect(first).toHaveFocus()

      await user.keyboard('{End}')
      expect(third).toHaveFocus()

      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('BottomSheet (M3 Expressive)', () => {
    it('renders modal bottom sheet with drag handle, title, and actions', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <BottomSheet
          isOpen={true}
          onClose={onClose}
          title="Filter Options"
          showDragHandle={true}
          actions={<button type="button">Apply</button>}
        >
          <div>Filter contents</div>
        </BottomSheet>,
      )

      const sheet = screen.getByRole('dialog', { name: 'Filter Options' })
      expect(sheet).toHaveClass('m3-bottom-sheet')
      expect(screen.getByText('Filter contents')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()

      const closeBtn = screen.getByRole('button', { name: 'Close bottom sheet' })
      await user.click(closeBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('supports standard non-modal bottom sheet without scrim', () => {
      render(
        <BottomSheet isOpen={true} modal={false} title="Persistent Panel">
          <p>Standard bottom sheet</p>
        </BottomSheet>,
      )

      expect(screen.queryByTestId('m3-bottom-sheet-scrim')).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Persistent Panel' })).toBeInTheDocument()
    })
  })

  describe('SideSheet (M3 Expressive)', () => {
    it('renders right side sheet with title, subtitle, and custom width', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <SideSheet
          isOpen={true}
          onClose={onClose}
          title="CV Preview"
          subtitle="Candidate: Jane Doe"
          position="right"
          width="480px"
        >
          <div>CV details content</div>
        </SideSheet>,
      )

      const sheet = screen.getByRole('dialog', { name: 'CV Preview' })
      expect(sheet).toHaveClass('m3-side-sheet', 'm3-side-sheet--right')
      expect(sheet).toHaveStyle({ width: '480px' })
      expect(screen.getByText('Candidate: Jane Doe')).toBeInTheDocument()

      const closeBtn = screen.getByRole('button', { name: 'Close side sheet' })
      await user.click(closeBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders left side sheet with appropriate class', () => {
      render(
        <SideSheet isOpen={true} position="left" title="Navigation Panel">
          <div>Side navigation links</div>
        </SideSheet>,
      )

      const sheet = screen.getByRole('dialog', { name: 'Navigation Panel' })
      expect(sheet).toHaveClass('m3-side-sheet--left')
    })
  })

  describe('Modal M3 Integration', () => {
    it('verifies Modal includes m3-dialog class alongside modal-card', () => {
      render(
        <Modal title="Integration Verification">
          <p>Modal body content</p>
        </Modal>,
      )

      const dialog = screen.getByRole('dialog', { name: 'Integration Verification' })
      expect(dialog).toHaveClass('modal-card')
      expect(dialog).toHaveClass('m3-dialog')
      expect(dialog).toHaveClass('card')
    })
  })
})
