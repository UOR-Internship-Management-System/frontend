import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const scanRoots = ['src', 'e2e', 'scripts', 'docs']
const allowed = [
  'scripts/verify-removed-scope.mjs',
  'src/shared/constants/removedScope.ts',
  'docs/architecture/removed-scope-guardrails.md',
  'docs/api/CV_Management_API_OpenAPI_v1.0.yaml',
  'docs/Project Documentations',
]

const terms = [
  'admin approval',
  'pending registration',
  'rejected registration',
  'temporary password',
  'skill master',
  'verified skill',
  'estimated gpa planner',
  'cv review',
  'cv approval',
  'company login',
  'company portal',
  'ai ranking',
  'ai scoring',
  'match percentage',
  'automated selection',
  'project approval',
  'project verification',
  'gpa inside internship request',
  'gpa request field',
]

const fileExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.md', '.yaml', '.yml'])
const violations = []

function normalize(filePath) {
  return filePath.split(path.sep).join('/')
}

function isAllowed(relativePath) {
  const normalized = normalize(relativePath)
  return allowed.some((entry) => normalized === entry || normalized.startsWith(`${entry}/`))
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return walk(fullPath)
    }
    return [fullPath]
  })
}

for (const scanRoot of scanRoots) {
  for (const file of walk(path.join(root, scanRoot))) {
    const relative = path.relative(root, file)
    if (isAllowed(relative) || !fileExtensions.has(path.extname(file))) {
      continue
    }

    const content = fs.readFileSync(file, 'utf8').toLowerCase()
    for (const term of terms) {
      if (content.includes(term)) {
        violations.push(`${normalize(relative)} -> ${term}`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error(
    `Removed-scope terms found outside approved guardrail contexts:\\n${violations.join('\\n')}`,
  )
  process.exit(1)
}

console.log('Removed-scope guardrail scan passed.')
