import { z } from 'zod'

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/

export function isCalendarDateOnly(value: string) {
  if (!dateOnlyPattern.test(value)) return false

  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

export function createDateOnlySchema(message = 'Enter a valid date.') {
  return z.string().refine(isCalendarDateOnly, message)
}
