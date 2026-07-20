import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractPath = 'docs/api/CV_Management_API_OpenAPI_v1.6.0.yaml'
const priorContractPath = 'docs/api/CV_Management_API_OpenAPI_v1.5.0.yaml'
const expectedContractSha256 = 'ebc5adb4b95380b3f66b38b06437a183a136149297916a90d19aaee0a85d8350'
const requiredFiles = [
  contractPath,
  priorContractPath,
  'docs/api/CV_Management_API_OpenAPI_v1.6.0_CHANGELOG.md',
  'docs/api/CV_Management_API_OpenAPI_v1.6.0_VALIDATION_REPORT.md',
  'docs/api/generated-client-notes.md',
  'docs/api/SPRINT_7_8_CONTRACT_DECISION_REGISTER.md',
  'docs/api/SPRINT_7_8_CONTRACT_TRACEABILITY_MATRIX.md',
  'src/shared/api/generated/README.md',
  'src/shared/api/generated/cvManagementApi.client.ts',
  'src/shared/api/generated/cvManagementApi.types.ts',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length > 0) {
  console.error(`Missing OpenAPI artifacts:\n${missing.join('\n')}`)
  process.exit(1)
}

const readLf = (file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n')
const contract = readLf(contractPath)
const priorContract = readLf(priorContractPath)
const actualHash = crypto.createHash('sha256').update(contract, 'utf8').digest('hex')

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (actualHash !== expectedContractSha256) {
  fail(
    `OpenAPI v1.6.0 checksum mismatch: expected ${expectedContractSha256}, received ${actualHash}`,
  )
}
if (!contract.trimStart().startsWith('openapi: 3.1.1'))
  fail('OpenAPI contract must start with openapi: 3.1.1')
if (!/^info:\s*$[\s\S]*?^ {2}version: 1\.6\.0\s*$/m.test(contract))
  fail('OpenAPI info.version must be 1.6.0')
if (!contract.includes('- url: /api/v1')) fail('OpenAPI server must remain /api/v1')

function parseOperations(source) {
  const lines = source.split('\n')
  const operations = new Map()
  let currentPath = null
  let currentMethod = null
  for (const line of lines) {
    const pathMatch = line.match(/^ {2}(\/[^:]+):\s*$/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      currentMethod = null
      continue
    }
    const methodMatch = line.match(/^ {4}(get|post|put|patch|delete):\s*$/)
    if (methodMatch && currentPath) {
      currentMethod = methodMatch[1]
      continue
    }
    const operationMatch = line.match(/^ {6}operationId:\s*(\S+)\s*$/)
    if (operationMatch && currentPath && currentMethod) {
      operations.set(`${currentPath} ${currentMethod}`, operationMatch[1])
    }
  }
  return operations
}

const priorOperations = parseOperations(priorContract)
const operations = parseOperations(contract)
const operationIds = new Map()
for (const [key, operationId] of operations) {
  if (operationIds.has(operationId)) fail(`Duplicate operationId: ${operationId}`)
  operationIds.set(operationId, key)
}
for (const [key, operationId] of priorOperations) {
  if (!operations.has(key)) fail(`OpenAPI v1.6.0 removed existing operation: ${key}`)
  if (operations.get(key) !== operationId) {
    fail(
      `OpenAPI v1.6.0 changed existing operationId for ${key}: ${operationId} -> ${operations.get(key)}`,
    )
  }
}

function sectionBlock(sectionName) {
  const marker = `\n  ${sectionName}:\n`
  const start = contract.indexOf(marker)
  if (start < 0) fail(`Missing components section: ${sectionName}`)
  const bodyStart = start + marker.length
  const tail = contract.slice(bodyStart)
  const next = tail.search(/\n {2}[A-Za-z][A-Za-z0-9_-]*:\n|\nsecurity:\n|\ntags:\n/)
  return next < 0 ? tail : tail.slice(0, next)
}

function namedBlock(sectionName, name) {
  const section = sectionBlock(sectionName)
  const marker = `\n    ${name}:\n`
  const normalized = `\n${section}`
  const start = normalized.indexOf(marker)
  if (start < 0) fail(`Missing ${sectionName} entry: ${name}`)
  const bodyStart = start + marker.length
  const tail = normalized.slice(bodyStart)
  const next = tail.search(/\n {4}[A-Za-z0-9_-]+:\n/)
  return next < 0 ? tail : tail.slice(0, next)
}

function operationBlock(pathName, method) {
  const pathMarker = `\n  ${pathName}:\n`
  const pathStart = contract.indexOf(pathMarker)
  if (pathStart < 0) fail(`Missing path: ${pathName}`)
  const pathTail = contract.slice(pathStart + pathMarker.length)
  const nextPath = pathTail.search(/\n {2}\/|\ncomponents:\n/)
  const pathBlock = nextPath < 0 ? pathTail : pathTail.slice(0, nextPath)
  const methodMarker = `\n    ${method}:\n`
  const normalized = `\n${pathBlock}`
  const methodStart = normalized.indexOf(methodMarker)
  if (methodStart < 0) fail(`Missing method: ${method.toUpperCase()} ${pathName}`)
  const methodTail = normalized.slice(methodStart + methodMarker.length)
  const nextMethod = methodTail.search(/\n {4}(get|post|put|patch|delete):\n/)
  return nextMethod < 0 ? methodTail : methodTail.slice(0, nextMethod)
}

// Resolve all local component refs without needing a YAML runtime dependency.
const componentSections = ['schemas', 'parameters', 'responses', 'headers', 'securitySchemes']
const componentNames = new Map(componentSections.map((section) => [section, new Set()]))
for (const section of componentSections) {
  let block = ''
  try {
    block = sectionBlock(section)
  } catch {
    continue
  }
  for (const match of block.matchAll(/^ {4}([A-Za-z0-9_-]+):\s*$/gm))
    componentNames.get(section).add(match[1])
}
for (const match of contract.matchAll(
  /\$ref:\s*['"]?#\/components\/(schemas|parameters|responses|headers|securitySchemes)\/([A-Za-z0-9_-]+)['"]?/g,
)) {
  const [, section, name] = match
  if (!componentNames.get(section)?.has(name))
    fail(`Unresolved local ref: #/components/${section}/${name}`)
}

const requiredPaths = [
  '/admin/students/{studentId}',
  '/admin/students/{studentId}/declared-skills',
  '/admin/students/{studentId}/projects',
  '/admin/students/{studentId}/latest-cv',
  '/admin/students/{studentId}/latest-cv/download',
  '/admin/companies',
  '/admin/companies/{companyId}',
  '/admin/internship-requests',
  '/admin/internship-requests/{requestId}',
  '/admin/internship-requests/{requestId}/required-skills',
  '/admin/internship-requests/{requestId}/required-skills/{requiredSkillId}',
  '/admin/candidate-filtering/runs',
  '/admin/candidate-filtering/runs/{filterRunId}',
  '/admin/candidate-filtering/runs/{filterRunId}/candidates',
  '/admin/shortlists',
  '/admin/shortlists/{shortlistId}',
  '/admin/shortlists/{shortlistId}/candidates',
  '/admin/shortlists/{shortlistId}/candidates/{studentId}',
  '/admin/shortlists/{shortlistId}/finalize',
  '/admin/exports/shortlists/{shortlistId}',
  '/admin/exports/{exportJobId}',
  '/admin/exports/{exportJobId}/download',
  '/admin/exports/shortlists/{shortlistId}/bulk-cvs',
  '/admin/exports/{exportJobId}/bulk-cvs/download',
]
for (const requiredPath of requiredPaths) {
  if (!contract.includes(`\n  ${requiredPath}:\n`)) fail(`Missing Sprint 7-8 path: ${requiredPath}`)
}

const strictSchemas = [
  'AdminLatestCvResponse',
  'AdminStudentCvSupportingDataResponse',
  'AdminStudentDetailResponse',
  'CompanyRequest',
  'CompanyUpdateRequest',
  'CompanyResponse',
  'PagedCompanyResponse',
  'InternshipRequiredSkillRequest',
  'InternshipRequiredSkillResponse',
  'InternshipRequestCreateRequest',
  'InternshipRequestUpdateRequest',
  'InternshipRequestSummaryResponse',
  'InternshipRequestResponse',
  'PagedInternshipRequestResponse',
  'CandidateFilteringCriteriaRequest',
  'CandidateFilteringCriteriaResponse',
  'CandidateFilteringRunResponse',
  'CandidateFilteringCandidateResponse',
  'PagedCandidateFilteringCandidateResponse',
  'ShortlistCreateRequest',
  'ShortlistCandidateRequest',
  'ShortlistCandidateResponse',
  'ShortlistResponse',
  'ShortlistDetailResponse',
  'ShortlistCandidateMutationResponse',
  'ShortlistFinalizeRequest',
  'ShortlistFinalizeResponse',
  'ShortlistSummaryExportCreateRequest',
  'BulkCvExportCreateRequest',
  'MissingCvStudentResponse',
  'ExportWarningResponse',
  'ExportJobResponse',
]
for (const schemaName of strictSchemas) {
  const block = namedBlock('schemas', schemaName)
  if (block.includes('type: object') && !block.includes('additionalProperties: false')) {
    fail(`${schemaName} must set additionalProperties: false`)
  }
}

const internshipSchemas = [
  'InternshipRequestCreateRequest',
  'InternshipRequestUpdateRequest',
  'InternshipRequestResponse',
]
for (const schemaName of internshipSchemas) {
  const block = namedBlock('schemas', schemaName)
  if (/^ {6}[A-Za-z0-9_]*gpa[A-Za-z0-9_]*:/im.test(block))
    fail(`${schemaName} contains persisted GPA criteria`)
}

const candidateSchemas = ['CandidateFilteringCandidateResponse', 'ShortlistCandidateResponse']
for (const schemaName of candidateSchemas) {
  const block = namedBlock('schemas', schemaName)
  for (const forbiddenProperty of [
    'score',
    'rank',
    'matchPercentage',
    'weightedScore',
    'probability',
    'recommendation',
  ]) {
    if (new RegExp(`^ {6}${forbiddenProperty}:`, 'm').test(block))
      fail(`${schemaName} contains forbidden ${forbiddenProperty}`)
  }
}

for (const forbiddenPath of [
  '/admin/registration-approvals',
  '/admin/skill-master',
  '/company/login',
  '/company/auth',
  '/admin/cv-reviews',
  '/admin/projects/approvals',
  '/admin/candidate-filtering/automatic-selection',
]) {
  if (contract.includes(`\n  ${forbiddenPath}`))
    fail(`Removed-scope path present: ${forbiddenPath}`)
}
if (/x-access-role:\s*COMPANY/.test(contract)) fail('COMPANY API role is forbidden')

for (const [key] of operations) {
  const [pathName, method] = key.split(' ')
  if (pathName.startsWith('/admin/students/{studentId}') && method !== 'get') {
    fail(`Admin Student deep-dive must remain read-only: ${key}`)
  }
  if (pathName.startsWith('/admin/skill') && method !== 'get')
    fail(`Admin taxonomy mutation is forbidden: ${key}`)
}

const latestCvDownload = operationBlock('/admin/students/{studentId}/latest-cv/download', 'get')
for (const fragment of ['application/pdf:', 'ContentDispositionPdf', 'x-audit-required: true']) {
  if (!latestCvDownload.includes(fragment)) fail(`Latest CV download missing: ${fragment}`)
}
const summaryDownload = operationBlock('/admin/exports/{exportJobId}/download', 'get')
if (!summaryDownload.includes('text/csv:') || !summaryDownload.includes('ContentDispositionCsv')) {
  fail('Shortlist summary download must be CSV-only')
}
const bulkDownload = operationBlock('/admin/exports/{exportJobId}/bulk-cvs/download', 'get')
if (!bulkDownload.includes('application/zip:') || !bulkDownload.includes('ContentDispositionZip')) {
  fail('Bulk CV download must be ZIP-only')
}
const exportJob = namedBlock('schemas', 'ExportJobResponse')
for (const fragment of ['missingCvCount:', 'missingCvStudents:', 'includedFileCount:']) {
  if (!exportJob.includes(fragment)) fail(`ExportJobResponse missing: ${fragment}`)
}
const exportType = namedBlock('schemas', 'ExportType')
if (!exportType.includes('BULK_LATEST_CV_ZIP')) fail('ExportType must include BULK_LATEST_CV_ZIP')
const finalizeOperation = operationBlock('/admin/shortlists/{shortlistId}/finalize', 'post')
for (const fragment of [
  'IfMatchVersion',
  'ShortlistGuidanceAcknowledgement409',
  'non-blocking',
  'x-audit-required: true',
]) {
  if (!finalizeOperation.includes(fragment)) fail(`Shortlist finalization missing: ${fragment}`)
}

const generatedExpectations = new Map([
  [
    'src/shared/api/generated/cvManagementApi.types.ts',
    [
      "version: '1.6.0'",
      'ApiAdminStudentDetailResponse',
      'ApiAdminLatestCvResponse',
      'ApiCompanyResponse',
      'ApiPagedCompanyResponse',
      'ApiInternshipRequestStatus',
      'ApiPagedInternshipRequestResponse',
      'ApiCandidateFilteringCriteriaRequest',
      'ApiFilterSkillMatchMode',
      'ApiPagedCandidateFilteringCandidateResponse',
      'ApiShortlistStatus',
      'ApiShortlistFinalizeResponse',
      'ApiPagedShortlistResponse',
      'ApiExportJobStatus',
      'ApiMissingCvStudentResponse',
    ],
  ],
  [
    'src/shared/api/generated/cvManagementApi.client.ts',
    ["version: '1.6.0'", `contractPath: '${contractPath}'`],
  ],
])
for (const [file, expectedFragments] of generatedExpectations) {
  const source = readLf(file)
  for (const fragment of expectedFragments) {
    if (!source.includes(fragment)) fail(`Generated artifact ${file} is missing: ${fragment}`)
  }
}

console.log(
  'OpenAPI v1.6.0 contract, Sprint 1-6 preservation, Sprint 7-8 scope guardrails, and deterministic metadata are synchronized.',
)
