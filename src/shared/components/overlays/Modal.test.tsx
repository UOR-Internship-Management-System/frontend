import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function ModalHarness({ size = 'default' }: { size?: 'default' | 'wide' }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">
        Open records
      </button>
      {isOpen ? (
        <Modal onClose={() => setIsOpen(false)} size={size} title="Academic records">
          <button type="button">First dialog action</button>
        </Modal>
      ) : null}
    </>
  )
}

describe('Modal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.querySelector('#root')?.remove()
  })

  it('renders at the document root so transformed page content cannot offset it', () => {
    render(
      <div style={{ transform: 'translateY(10px)' }}>
        <Modal title="Edit profile entry">
          <p>Modal content</p>
        </Modal>
      </div>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Edit profile entry' })

    expect(dialog.parentElement?.parentElement).toBe(document.body)
  })

  it('isolates the application root and restores it with focus after closing', async () => {
    const user = userEvent.setup()
    const appRoot = document.createElement('div')
    appRoot.id = 'root'
    document.body.appendChild(appRoot)
    render(<ModalHarness />, { container: appRoot })

    const trigger = screen.getByRole('button', { name: 'Open records' })
    await user.click(trigger)

    expect(screen.getByRole('dialog', { name: 'Academic records' })).toBeInTheDocument()
    expect(appRoot).toHaveAttribute('aria-hidden', 'true')
    expect(appRoot).toHaveAttribute('inert')
    expect(appRoot.inert).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Close Academic records' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(appRoot).not.toHaveAttribute('aria-hidden')
    expect(appRoot).not.toHaveAttribute('inert')
    expect(appRoot.inert).toBe(false)
    expect(trigger).toHaveFocus()
  })

  it('uses the wide variant and closes immediately when reduced motion is requested', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia,
    )
    const user = userEvent.setup()
    render(<ModalHarness size="wide" />)
    await user.click(screen.getByRole('button', { name: 'Open records' }))

    expect(screen.getByRole('dialog')).toHaveClass('modal-card-wide')
    await user.click(screen.getByRole('button', { name: 'Close Academic records' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
