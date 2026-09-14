import { useState } from 'react'

export type DatePickerProps = {
  value?: string // YYYY-MM-DD
  defaultValue?: string
  onChange?: (dateString: string) => void
  label?: string
  className?: string
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  label = 'Select date',
  className = '',
}: DatePickerProps) {
  const initialDate = value ? new Date(value) : defaultValue ? new Date(defaultValue) : new Date()
  const [viewDate, setViewDate] = useState<Date>(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : defaultValue ? new Date(defaultValue) : null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleSelectDay = (day: number) => {
    const chosen = new Date(year, month, day)
    setSelectedDate(chosen)
    const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange?.(isoString)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day
  }

  const formattedHeader = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'Select date'

  return (
    <div className={`m3-date-picker ${className}`.trim()} role="dialog" aria-label={label}>
      <div className="m3-date-picker-header">
        <span className="m3-date-picker-label">{label}</span>
        <div className="m3-date-picker-title">{formattedHeader}</div>
      </div>

      <div className="m3-calendar-nav">
        <button
          type="button"
          aria-label="Previous month"
          className="m3-icon-button m3-icon-button--size-sm"
          onClick={prevMonth}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            chevron_left
          </span>
        </button>

        <span className="m3-calendar-month-year">
          {monthNames[month]} {year}
        </span>

        <button
          type="button"
          aria-label="Next month"
          className="m3-icon-button m3-icon-button--size-sm"
          onClick={nextMonth}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            chevron_right
          </span>
        </button>
      </div>

      <div className="m3-calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
          <span key={i} className="m3-calendar-weekday">
            {wd}
          </span>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const selected = isSelected(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              type="button"
              className={`m3-calendar-day ${selected ? 'm3-calendar-day--selected' : ''} ${
                today ? 'm3-calendar-day--today' : ''
              }`.trim()}
              onClick={() => handleSelectDay(day)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
