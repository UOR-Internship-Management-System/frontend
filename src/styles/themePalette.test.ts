import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const stylesheet = readFileSync('src/index.css', 'utf8')
const lightTheme = stylesheet.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
const darkTheme = stylesheet.match(/:root\.dark,\s*\nbody\.dark-mode\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

function token(theme: string, name: string) {
  return theme.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim()
}

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  )
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

function contrastRatio(foreground: string, background: string) {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (left, right) => right - left,
  )
  return (values[0] + 0.05) / (values[1] + 0.05)
}

describe('professional application palette', () => {
  it('keeps the approved light and dark semantic tokens', () => {
    expect(lightTheme).not.toBe('')
    expect(darkTheme).not.toBe('')
    expect({
      primary: token(lightTheme, 'primary'),
      page: token(lightTheme, 'surface-container'),
      surface: token(lightTheme, 'canvas'),
      text: token(lightTheme, 'text'),
      muted: token(lightTheme, 'muted'),
      strongBorder: token(lightTheme, 'border-strong'),
      sidebar: token(lightTheme, 'sidebar-bg'),
    }).toEqual({
      primary: '#1e40af',
      page: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#475569',
      strongBorder: '#64748b',
      sidebar: '#0f172a',
    })
    expect({
      primary: token(darkTheme, 'primary'),
      page: token(darkTheme, 'surface-container'),
      surface: token(darkTheme, 'canvas'),
      text: token(darkTheme, 'text'),
      muted: token(darkTheme, 'muted'),
      strongBorder: token(darkTheme, 'border-strong'),
    }).toEqual({
      primary: '#93c5fd',
      page: '#0b1120',
      surface: '#111827',
      text: '#f8fafc',
      muted: '#cbd5e1',
      strongBorder: '#64748b',
    })
  })

  it('meets the intended WCAG contrast floors for text, actions, and control boundaries', () => {
    const normalTextPairs = [
      ['#1e40af', '#ffffff'],
      ['#0f172a', '#f8fafc'],
      ['#475569', '#f8fafc'],
      ['#047857', '#ffffff'],
      ['#b45309', '#ffffff'],
      ['#b91c1c', '#ffffff'],
      ['#93c5fd', '#172554'],
      ['#f8fafc', '#0b1120'],
      ['#cbd5e1', '#111827'],
    ] as const
    normalTextPairs.forEach(([foreground, background]) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5)
    })

    expect(contrastRatio('#64748b', '#ffffff')).toBeGreaterThanOrEqual(3)
    expect(contrastRatio('#64748b', '#111827')).toBeGreaterThanOrEqual(3)
  })

  it('does not reintroduce the previous purple and unrelated feature accents', () => {
    expect(stylesheet).not.toMatch(/#6750a4|#d0bcff|#4058c7|#b9c3ff|#f6a800|#b26a00/i)
  })
})
