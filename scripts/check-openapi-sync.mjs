import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractPath = 'docs/api/CV_Management_API_OpenAPI_v1.4.0.yaml'
const expectedContractSha256 = 'e96b7cb2efbe84295753ff03924b747f90196ada4726d7eebd39fd64a3e83282'
const requiredFiles = [
  contractPath,
  'docs/api/CV_Management_API_OpenAPI_v1.4.0_CHANGELOG.md',
  'docs/api/CV_Management_API_OpenAPI_v1.4.0_VALIDATION_REPORT.md',
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
// Git may materialize text files with CRLF on Windows. The approved checksum
// represents the canonical LF contract content, so normalize line endings
// without ignoring any semantic OpenAPI changes.
const canonicalContract = contract.replace(/\r\n?/g, '\n')
const actualHash = crypto.createHash('sha256').update(canonicalContract, 'utf8').digest('hex')

if (actualHash !== expectedContractSha256) {
  console.error(
    `OpenAPI v1.4.0 checksum mismatch: expected ${expectedContractSha256}, received ${actualHash}`,
  )
  process.exit(1)
}

if (!contract.trimStart().startsWith('openapi: 3.1.1')) {
  console.error('OpenAPI contract must start with openapi: 3.1.1')
  process.exit(1)
}

if (!/^info:\s*$[\s\S]*?^ {2}version: 1\.4\.0\s*$/m.test(contract)) {
  console.error('OpenAPI info.version must be 1.4.0')
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
  '/me/academic-records:',
  '/me/academic-records/gpa:',
  '/me/cv/source-freshness:',
  '/me/cv/preview:',
  '/me/cv/versions:',
  '/me/cv/versions/{cvVersionId}:',
  '/me/cv/versions/{cvVersionId}/download:',
  '/me/cv/latest/download:',
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
  'GpaAvailabilityStatus:',
  'CvFreshnessStatus:',
  'CvSourceArea:',
  'CvSectionType:',
  'AcademicRecordResponse:',
  'AcademicRecordSourceResponse:',
  'GpaSummaryResponse:',
  'CvFreshnessResponse:',
  'CvPreviewRequest:',
  'CvPreviewConfigurationResponse:',
  'CvPreviewResponse:',
  'CvVersionCreateRequest:',
  'GeneratedFileMetadataResponse:',
  'CvVersionResponse:',
  'PagedAcademicRecordResponse:',
  'PagedCvVersionResponse:',
]

for (const fragment of [...requiredPaths, ...requiredSchemas]) {
  if (!contract.includes(fragment)) {
    console.error(`OpenAPI contract is missing required Sprint 1-5 contract fragment: ${fragment}`)
    process.exit(1)
  }
}

for (const obsoleteSchema of ['DeclaredSkillRequest:', 'ProjectRequest:']) {
  if (contract.includes(obsoleteSchema)) {
    console.error(`OpenAPI contract still contains obsolete Sprint 4 schema: ${obsoleteSchema}`)
    process.exit(1)
  }
}

function schemaBlock(schemaName) {
  const match = contract.match(
    new RegExp(
      `^    ${schemaName}:\\s*$([\\s\\S]*?)(?=^    [A-Za-z0-9]+:\\s*$|^  [a-zA-Z]+:\\s*$)`,
      'm',
    ),
  )
  if (!match) {
    console.error(`Unable to inspect OpenAPI schema: ${schemaName}`)
    process.exit(1)
  }
  return match[1]
}

function pathBlock(pathName) {
  const escapedPath = pathName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = contract.match(
    new RegExp(`^  ${escapedPath}:\\s*$([\\s\\S]*?)(?=^  \\/|^components:)`, 'm'),
  )
  if (!match) {
    console.error(`Unable to inspect OpenAPI path: ${pathName}`)
    process.exit(1)
  }
  return match[1]
}

const saveRequest = schemaBlock('CvVersionCreateRequest')
const saveProperties =
  saveRequest.match(
    /^      properties:\s*$([\s\S]*?)(?=^      [a-zA-Z]|^    [A-Za-z0-9]+:)/m,
  )?.[1] ?? ''
const savePropertyNames = [...saveProperties.matchAll(/^        ([A-Za-z0-9]+):\s*$/gm)].map(
  (match) => match[1],
)
if (savePropertyNames.length !== 1 || savePropertyNames[0] !== 'previewId') {
  console.error('CvVersionCreateRequest must contain only previewId')
  process.exit(1)
}

const previewRequest = schemaBlock('CvPreviewRequest')
if (/^        notes:\s*$/m.test(previewRequest) || /^        notes:\s*$/m.test(saveRequest)) {
  console.error('OpenAPI Sprint 5 preview/save requests must not contain notes')
  process.exit(1)
}

if (!schemaBlock('CvFreshnessStatus').includes('- NOT_SAVED')) {
  console.error('CvFreshnessStatus must include NOT_SAVED')
  process.exit(1)
}
if (!schemaBlock('CvPreviewResponse').includes('latexSource:')) {
  console.error('CvPreviewResponse must include latexSource')
  process.exit(1)
}
if (!schemaBlock('PagedAcademicRecordResponse').includes('AcademicRecordResponse')) {
  console.error('PagedAcademicRecordResponse items must be typed')
  process.exit(1)
}
if (!schemaBlock('PagedCvVersionResponse').includes('CvVersionResponse')) {
  console.error('PagedCvVersionResponse items must be typed')
  process.exit(1)
}

for (const downloadPath of ['/me/cv/versions/{cvVersionId}/download', '/me/cv/latest/download']) {
  const block = pathBlock(downloadPath)
  if (!block.includes('application/pdf:') || !block.includes('Content-Disposition:')) {
    console.error(`${downloadPath} must document PDF success and Content-Disposition`)
    process.exit(1)
  }
  if (block.includes('application/zip:') || block.includes('application/octet-stream:')) {
    console.error(`${downloadPath} must be PDF-only on success`)
    process.exit(1)
  }
}

const generatedExpectations = new Map([
  [
    'src/shared/api/generated/cvManagementApi.types.ts',
    [
      "version: '1.4.0'",
      'ApiDeclaredSkillCreateRequest',
      'ApiDeclaredSkillUpdateRequest',
      'ApiProjectCreateRequest',
      'ApiProjectUpdateRequest',
      'page: ApiPageMetadata',
      'sort: string',
      'ApiGpaAvailabilityStatus',
      'ApiCvFreshnessStatus',
      'ApiCvSourceArea',
      'ApiCvSectionType',
      'ApiAcademicRecordResponse',
      'ApiAcademicRecordSourceResponse',
      'ApiGpaSummaryResponse',
      'ApiCvFreshnessResponse',
      'ApiCvPreviewRequest',
      'ApiCvPreviewConfigurationResponse',
      'ApiCvPreviewResponse',
      'ApiCvVersionCreateRequest',
      'ApiGeneratedFileMetadataResponse',
      'ApiCvVersionResponse',
      'ApiPagedAcademicRecordResponse',
      'ApiPagedCvVersionResponse',
    ],
  ],
  [
    'src/shared/api/generated/cvManagementApi.client.ts',
    ["version: '1.4.0'", `contractPath: '${contractPath}'`],
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

console.log('OpenAPI v1.4.0 contract and deterministic metadata are synchronized.')
