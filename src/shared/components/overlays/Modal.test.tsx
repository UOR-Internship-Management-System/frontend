import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
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
})
