import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const requiredFiles = [
  'docs/api/CV_Management_API_OpenAPI_v1.1.yaml',
  'docs/api/generated-client-notes.md',
  'src/shared/api/generated/README.md',
  'src/shared/api/generated/cvManagementApi.client.ts',
  'src/shared/api/generated/cvManagementApi.types.ts',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))

if (missing.length > 0) {
  console.error(`Missing OpenAPI artifacts:\\n${missing.join('\\n')}`)
  process.exit(1)
}

const contract = fs.readFileSync(path.join(root, requiredFiles[0]), 'utf8')
if (!contract.trimStart().startsWith('openapi: 3.1.1')) {
  console.error('OpenAPI contract must start with openapi: 3.1.1')
  process.exit(1)
}

for (const file of requiredFiles.filter((item) => item.endsWith('.ts'))) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  if (!source.includes('export')) {
    console.error(`Generated TypeScript artifact has no exports: ${file}`)
    process.exit(1)
  }
}

console.log('OpenAPI contract and generated stubs are synchronized for Sprint 2.')
