import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const stylesheet = readFileSync('src/index.css', 'utf8')
const marker = '/* Sprint 7 — read-only administrative Student Deep-Dive */'
const deepDiveStyles = stylesheet.slice(stylesheet.indexOf(marker))
const productionUi = [
  'src/features/student-management/pages/StudentDeepDivePage.tsx',
  'src/features/student-management/components/LatestSavedCvPanel.tsx',
  'src/features/student-management/components/ReadOnlyStudentProfile.tsx',
  'src/features/student-management/components/StudentDeepDiveSections.tsx',
]
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')

describe('Student Deep-Dive presentation and scope guardrails', () => {
  it('keeps responsive one-column and mobile table rules in the production stylesheet', () => {
    expect(deepDiveStyles).toContain('@media (max-width: 1024px)')
    expect(deepDiveStyles).toMatch(
      /\.student-deep-dive-layout\s*\{\s*grid-template-columns:\s*1fr;/,
    )
    expect(deepDiveStyles).toContain('@media (max-width: 680px)')
    expect(deepDiveStyles).toContain('content: attr(data-label)')
  })

  it('uses semantic theme tokens so the global dark palette controls every Deep-Dive surface', () => {
    expect(stylesheet).toMatch(/:root\.dark,\s*\nbody\.dark-mode/)
    expect(deepDiveStyles).toMatch(/var\(--color-card\)/)
    expect(deepDiveStyles).toMatch(/var\(--color-text-muted\)/)
    expect(deepDiveStyles).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('contains no removed-scope lifecycle wording or obsolete tab placeholder', () => {
    expect(productionUi).not.toMatch(
      /\b(approve|approval|verify|verified|review|reject|rejected|ranking|match\s+percentage|AI\s+scoring)\b/i,
    )
    expect(existsSync('src/features/student-management/components/StudentDeepDiveTabs.tsx')).toBe(
      false,
    )
  })
})
