import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const blockedTerms = [
  `temporary ${'password'}`,
  `skill ${'master'}`,
  `verified ${'skill'}`,
  `estimated ${'GPA'} planner`,
  `CV ${'review'}`,
  `CV ${'approval'}`,
  `company ${'login'}`,
  `company ${'portal'}`,
  `AI ${'ranking'}`,
  `AI ${'scoring'}`,
  `match ${'percentage'}`,
  `automated ${'selection'}`,
]

const roots = ['src', 'e2e', 'scripts', 'docs']
const allowed = ['scripts/verify-removed-scope.mjs', 'src/shared/constants/removedScope.ts', 'docs/architecture/removed-scope-guardrails.md', 'docs/Project Documentations']
const files = []

const collect = (path) => {
  if (!existsSync(path) || allowed.some((entry) => path.startsWith(entry))) return
  const stats = statSync(path)
  if (stats.isDirectory()) {
    for (const child of readdirSync(path)) collect(join(path, child))
  } else if (/\.(ts|tsx|js|mjs|md|yml|yaml)$/.test(path)) {
    files.push(path)
  }
}

roots.forEach(collect)

const findings = []
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  for (const term of blockedTerms) {
    if (content.includes(term)) findings.push(`${file}: ${term}`)
  }
}

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exitCode = 1
} else {
  console.log('Removed-scope guard passed.')
}
