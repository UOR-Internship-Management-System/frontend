import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker, TimePicker } from './index'
import { SearchBar } from '../data'

describe('Tier 5: Pickers and Search Primitives', () => {
  describe('SearchBar', () => {
    it('handles search input and clear action', async () => {
      const handleChange = vi.fn()
      const handleClear = vi.fn()

      render(
        <SearchBar
          placeholder="Search candidates..."
          value="Kavin"
          onChange={handleChange}
          onClear={handleClear}
        />,
      )

      const input = screen.getByPlaceholderText('Search candidates...')
      expect(input).toHaveValue('Kavin')

      const clearBtn = screen.getByRole('button', { name: 'Clear search' })
      await userEvent.click(clearBtn)
      expect(handleClear).toHaveBeenCalledTimes(1)
    })

    it('renders suggestions dropdown on focus', async () => {
      const handleSelect = vi.fn()
      const suggestions = ['Full Stack Engineer', 'React Developer', 'Data Scientist']

      render(
        <SearchBar
          placeholder="Search jobs..."
          suggestions={suggestions}
          onSelectSuggestion={handleSelect}
        />,
      )

      const input = screen.getByPlaceholderText('Search jobs...')
      await userEvent.click(input)

      expect(screen.getByRole('listbox', { name: 'Search suggestions' })).toBeInTheDocument()
      expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument()

      await userEvent.click(screen.getByText('React Developer'))
      expect(handleSelect).toHaveBeenCalledWith('React Developer')
    })
  })

  describe('DatePicker', () => {
    it('renders calendar, navigates months, and fires onChange with ISO date', async () => {
      const handleChange = vi.fn()

      render(
        <DatePicker
          label="Start date"
          defaultValue="2026-09-15"
          onChange={handleChange}
        />,
      )

      expect(screen.getByText('Start date')).toBeInTheDocument()
      expect(screen.getByText(/September 2026/i)).toBeInTheDocument()

      const day18 = screen.getByRole('button', { name: '18' })
      await userEvent.click(day18)
      expect(handleChange).toHaveBeenCalledWith('2026-09-18')

      const nextMonthBtn = screen.getByRole('button', { name: 'Next month' })
      await userEvent.click(nextMonthBtn)
      expect(screen.getByText(/October 2026/i)).toBeInTheDocument()
    })
  })

  describe('TimePicker', () => {
    it('handles hour/minute input and toggles AM/PM period', async () => {
      const handleChange = vi.fn()

      render(
        <TimePicker
          label="Interview time"
          defaultValue="14:30"
          onChange={handleChange}
        />,
      )

      expect(screen.getByText('Interview time')).toBeInTheDocument()
      const hourInput = screen.getByRole('spinbutton', { name: 'Hour' })
      expect(hourInput).toHaveValue(2) // 14:30 in 12h is 02:30 PM

      const amBtn = screen.getByRole('button', { name: 'AM' })
      await userEvent.click(amBtn)
      expect(handleChange).toHaveBeenCalledWith('02:30')
    })
  })
})
