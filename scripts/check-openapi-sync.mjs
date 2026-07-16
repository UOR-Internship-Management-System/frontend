import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractPath = 'docs/api/CV_Management_API_OpenAPI_v1.3.0.yaml'
const expectedContractSha256 = 'd920516cec8733e0011ea33e9be4abcad9554f5f7b6a97dd0599825cb462aa5e'
const requiredFiles = [
  contractPath,
  'docs/api/generated-client-notes.md',
  'src/shared/api/generated/README.md',
  'src/shared/api/generated/cvManagementApi.client.ts',
  'src/shared/api/generated/cvManagementApi.types.ts',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length > 0) {
  console.error(`Missing OpenAPI artifacts:\n${missing.join('\n')}`)
  process.exit(1)
}

const contractBuffer = fs.readFileSync(path.join(root, contractPath))
const contract = contractBuffer.toString('utf8')
const actualHash = crypto.createHash('sha256').update(contractBuffer).digest('hex')

if (actualHash !== expectedContractSha256) {
  console.error(
    `OpenAPI v1.3.0 checksum mismatch: expected ${expectedContractSha256}, received ${actualHash}`,
  )
  process.exit(1)
}

if (!contract.trimStart().startsWith('openapi: 3.1.1')) {
  console.error('OpenAPI contract must start with openapi: 3.1.1')
  process.exit(1)
}

if (!/^info:\s*$[\s\S]*?^ {2}version: 1\.3\.0\s*$/m.test(contract)) {
  console.error('OpenAPI info.version must be 1.3.0')
  process.exit(1)
}

const requiredPaths = [
  '/skill-taxonomy:',
  '/skill-taxonomy/clusters:',
  '/skill-taxonomy/categories:',
  '/skill-taxonomy/skills:',
  '/me/declared-skills:',
  '/me/declared-skills/{declaredSkillId}:',
  '/me/projects:',
  '/me/projects/{projectId}:',
]

const requiredSchemas = [
  'DeclaredSkillCreateRequest:',
  'DeclaredSkillUpdateRequest:',
  'DeclaredSkillResponse:',
  'PagedDeclaredSkillResponse:',
  'ProjectCreateRequest:',
  'ProjectUpdateRequest:',
  'ProjectResponse:',
  'PagedProjectResponse:',
  'SkillTaxonomyResponse:',
  'PagedIndividualSkillResponse:',
  'PagedSkillCategoryResponse:',
  'PagedSkillClusterResponse:',
  'IndividualSkillResponse:',
  'SkillCategoryResponse:',
  'SkillClusterResponse:',
  'IfMatch:',
]

for (const fragment of [...requiredPaths, ...requiredSchemas]) {
  if (!contract.includes(fragment)) {
    console.error(`OpenAPI contract is missing required Sprint 4 contract fragment: ${fragment}`)
    process.exit(1)
  }
}

for (const obsoleteSchema of ['DeclaredSkillRequest:', 'ProjectRequest:']) {
  if (contract.includes(obsoleteSchema)) {
    console.error(`OpenAPI contract still contains obsolete Sprint 4 schema: ${obsoleteSchema}`)
    process.exit(1)
  }
}

const generatedExpectations = new Map([
  [
    'src/shared/api/generated/cvManagementApi.types.ts',
    [
      "version: '1.3.0'",
      'ApiDeclaredSkillCreateRequest',
      'ApiDeclaredSkillUpdateRequest',
      'ApiProjectCreateRequest',
      'ApiProjectUpdateRequest',
      'page: ApiPageMetadata',
      'sort: string',
    ],
  ],
  [
    'src/shared/api/generated/cvManagementApi.client.ts',
    ["version: '1.3.0'", `contractPath: '${contractPath}'`],
  ],
])

for (const [file, expectedFragments] of generatedExpectations) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  for (const fragment of expectedFragments) {
    if (!source.includes(fragment)) {
      console.error(`Generated artifact ${file} is missing: ${fragment}`)
      process.exit(1)
    }
  }
}

console.log('OpenAPI v1.3.0 contract and deterministic metadata are synchronized.')
