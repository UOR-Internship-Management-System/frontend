import { useState } from 'react'

export type TimePickerProps = {
  value?: string // "HH:mm" (24h)
  defaultValue?: string
  onChange?: (timeString: string) => void
  label?: string
  className?: string
}

export function TimePicker({
  value,
  defaultValue = '09:00',
  onChange,
  label = 'Select time',
  className = '',
}: TimePickerProps) {
  const parseTime = (val: string) => {
    const [hStr, mStr] = val.split(':')
    const h = Number.parseInt(hStr, 10) || 0
    const m = Number.parseInt(mStr, 10) || 0
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return { hour: h12, minute: m, period }
  }

  const initial = parseTime(value ?? defaultValue)
  const [hour, setHour] = useState(initial.hour)
  const [minute, setMinute] = useState(initial.minute)
  const [period, setPeriod] = useState(initial.period)

  const emitTime = (h: number, m: number, p: string) => {
    let h24 = h
    if (p === 'PM' && h < 12) h24 += 12
    if (p === 'AM' && h === 12) h24 = 0
    const formatted = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    onChange?.(formatted)
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number.parseInt(e.target.value, 10) || 1
    if (val > 12) val = 12
    if (val < 1) val = 1
    setHour(val)
    emitTime(val, minute, period)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number.parseInt(e.target.value, 10) || 0
    if (val > 59) val = 59
    if (val < 0) val = 0
    setMinute(val)
    emitTime(hour, val, period)
  }

  const togglePeriod = (p: 'AM' | 'PM') => {
    setPeriod(p)
    emitTime(hour, minute, p)
  }

  return (
    <div className={`m3-time-picker ${className}`.trim()} role="group" aria-label={label}>
      <span className="m3-label-medium" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </span>

      <div className="m3-time-display">
        <input
          type="number"
          aria-label="Hour"
          min={1}
          max={12}
          value={String(hour).padStart(2, '0')}
          className="m3-time-input-box"
          onChange={handleHourChange}
        />

        <span className="m3-time-colon">:</span>

        <input
          type="number"
          aria-label="Minute"
          min={0}
          max={59}
          value={String(minute).padStart(2, '0')}
          className="m3-time-input-box"
          onChange={handleMinuteChange}
        />

        <div className="m3-time-ampm-group">
          <button
            type="button"
            className={`m3-time-ampm-btn ${period === 'AM' ? 'm3-time-ampm-btn--selected' : ''}`}
            onClick={() => togglePeriod('AM')}
          >
            AM
          </button>
          <button
            type="button"
            className={`m3-time-ampm-btn ${period === 'PM' ? 'm3-time-ampm-btn--selected' : ''}`}
            onClick={() => togglePeriod('PM')}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  )
}
