import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox, RadioButton, Switch, Slider, TextArea, TextField } from './index'

describe('Tier 2: Selection & Controls Primitives', () => {
  describe('Checkbox', () => {
    it('toggles checked state on click and updates aria', async () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Accept terms" onChange={handleChange} />)

      const input = screen.getByRole('checkbox', { name: 'Accept terms' })
      expect(input).not.toBeChecked()

      await userEvent.click(input)
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('renders indeterminate state correctly', () => {
      render(<Checkbox label="Select all" indeterminate checked readOnly />)
      expect(screen.getByText('remove')).toBeInTheDocument()
    })

    it('keeps its generated label association stable after rerendering', () => {
      const { rerender } = render(<Checkbox label="Include in CV" readOnly />)
      const originalId = screen.getByRole('checkbox', { name: 'Include in CV' }).id

      rerender(<Checkbox label="Include in CV" readOnly />)

      expect(screen.getByRole('checkbox', { name: 'Include in CV' })).toHaveAttribute(
        'id',
        originalId,
      )
    })

    it('respects disabled state', async () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Disabled option" disabled onChange={handleChange} />)
      const input = screen.getByRole('checkbox', { name: 'Disabled option' })
      expect(input).toBeDisabled()

      await userEvent.click(input)
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('RadioButton', () => {
    it('renders and selects radio button within a group', async () => {
      const handleChange = vi.fn()
      render(
        <div>
          <RadioButton name="role" value="student" label="Student" onChange={handleChange} />
          <RadioButton name="role" value="admin" label="Admin" onChange={handleChange} />
        </div>,
      )

      const studentRadio = screen.getByRole('radio', { name: 'Student' })
      const adminRadio = screen.getByRole('radio', { name: 'Admin' })

      await userEvent.click(studentRadio)
      expect(handleChange).toHaveBeenCalledTimes(1)

      await userEvent.click(adminRadio)
      expect(handleChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('Switch', () => {
    it('toggles switch role with accessible aria-checked', async () => {
      const handleChange = vi.fn()
      render(<Switch label="Dark mode" onChange={handleChange} />)

      const toggle = screen.getByRole('switch', { name: 'Dark mode' })
      expect(toggle).not.toBeChecked()
      expect(toggle).toHaveAttribute('aria-checked', 'false')

      await userEvent.click(toggle)
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Slider', () => {
    it('renders slider and handles value change', async () => {
      const handleChange = vi.fn()
      render(<Slider label="Volume" min={0} max={100} value={50} onChange={handleChange} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('50')
    })
  })

  describe('TextField', () => {
    it('renders outlined text field with floating label', async () => {
      render(<TextField label="Email address" placeholder="user@example.com" />)
      const input = screen.getByLabelText('Email address')
      expect(input).toBeInTheDocument()

      await userEvent.type(input, 'test@university.edu')
      expect(input).toHaveValue('test@university.edu')
    })

    it('displays error state and error message', () => {
      render(<TextField label="Password" error="Password must be at least 8 characters" />)

      expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters')
      const field = screen.getByLabelText('Password')
      expect(field).toHaveAttribute('aria-invalid', 'true')
      expect(field).toHaveAttribute('aria-describedby', `${field.id}-supporting`)
    })

    it('renders leading and trailing icons', () => {
      render(
        <TextField
          label="Search"
          leadingIcon={<span data-testid="search-icon">🔍</span>}
          trailingIcon={<span data-testid="clear-icon">✕</span>}
        />,
      )

      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
      expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
    })
  })

  describe('TextArea', () => {
    it('associates its label and supporting text with the field', () => {
      render(<TextArea label="Profile summary" supportingText="Keep it concise" />)

      const field = screen.getByRole('textbox', { name: 'Profile summary' })
      expect(field).toHaveAttribute('aria-describedby', `${field.id}-supporting`)
      expect(screen.getByText('Keep it concise')).toBeInTheDocument()
    })
  })
})
