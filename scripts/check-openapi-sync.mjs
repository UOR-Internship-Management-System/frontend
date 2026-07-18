import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractPath = 'docs/api/CV_Management_API_OpenAPI_v1.5.0.yaml'
const expectedContractSha256 = '7b67a7c071e57e6619ba655501b8f6053a81454af1d80a50bf610ff3838f6521'
const requiredFiles = [
  contractPath,
  'docs/api/CV_Management_API_OpenAPI_v1.5.0_CHANGELOG.md',
  'docs/api/CV_Management_API_OpenAPI_v1.5.0_VALIDATION_REPORT.md',
  'docs/api/generated-client-notes.md',
  'src/shared/api/generated/README.md',
  'src/shared/api/generated/cvManagementApi.client.ts',
  'src/shared/api/generated/cvManagementApi.types.ts',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length > 0) {
  console.error(`Missing OpenAPI artifacts:
${missing.join('\n')}`)
  process.exit(1)
}

const contract = fs.readFileSync(path.join(root, contractPath), 'utf8')
const canonicalContract = contract.replace(/\r\n?/g, '\n')
const actualHash = crypto.createHash('sha256').update(canonicalContract, 'utf8').digest('hex')
if (actualHash !== expectedContractSha256) {
  console.error(
    `OpenAPI v1.5.0 checksum mismatch: expected ${expectedContractSha256}, received ${actualHash}`,
  )
  process.exit(1)
}
if (!contract.trimStart().startsWith('openapi: 3.1.1')) {
  console.error('OpenAPI contract must start with openapi: 3.1.1')
  process.exit(1)
}
if (!/^info:\s*$[\s\S]*?^ {2}version: 1\.5\.0\s*$/m.test(contract)) {
  console.error('OpenAPI info.version must be 1.5.0')
  process.exit(1)
}

const requiredFragments = [
  '/skill-taxonomy:',
  '/me/declared-skills:',
  '/me/projects:',
  '/me/academic-records:',
  '/me/cv/source-freshness:',
  '/me/cv/preview:',
  '/me/cv:',
  '/me/cv/download:',
  '/admin/dashboard/metrics:',
  '/admin/academic-ledger/uploads:',
  '/admin/academic-ledger/uploads/{uploadId}/staged-rows:',
  '/admin/academic-ledger/uploads/{uploadId}/validation-results:',
  '/admin/academic-ledger/uploads/{uploadId}/commit:',
  '/admin/students:',
  '/admin/students/{studentId}/academic-records:',
  'CvSelectedRecordIds:',
  'CvPreviewRequest:',
  'CvPreviewResponse:',
  'CvSaveRequest:',
  'CvResponse:',
  'AdminDashboardMetricsResponse:',
  'AcademicLedgerUploadRequest:',
  'AcademicLedgerUploadStatus:',
  'AcademicLedgerValidationStatus:',
  'AcademicLedgerUploadSummaryResponse:',
  'AcademicLedgerUploadDetailResponse:',
  'PagedAcademicLedgerUploadResponse:',
  'AcademicLedgerStagedRowResponse:',
  'PagedAcademicLedgerStagedRowResponse:',
  'AcademicLedgerValidationErrorResponse:',
  'AcademicLedgerValidationResultResponse:',
  'AcademicLedgerCommitRequest:',
  'AcademicLedgerCommitResponse:',
  'StudentSummaryResponse:',
  'PagedStudentSummaryResponse:',
  'RegisteredStudentSort:',
  'AcademicLedgerStagedRowSort:',
]
for (const fragment of requiredFragments) {
  if (!contract.includes(fragment)) {
    console.error(`OpenAPI contract is missing required fragment: ${fragment}`)
    process.exit(1)
  }
}

for (const obsoleteFragment of [
  '/me/cv/versions',
  '/me/cv/latest/download',
  'CvOptionalSections:',
  'sectionOrder:',
  'optionalSections:',
  'latexSource:',
  '/admin/registration-approvals',
  '/admin/skill-master',
  '/company/login',
]) {
  if (contract.includes(obsoleteFragment)) {
    console.error(`OpenAPI contract contains removed fragment: ${obsoleteFragment}`)
    process.exit(1)
  }
}

function schemaBlock(schemaName) {
  const marker = `\n    ${schemaName}:\n`
  const start = contract.indexOf(marker)
  if (start < 0) {
    console.error(`Unable to inspect OpenAPI schema: ${schemaName}`)
    process.exit(1)
  }
  const bodyStart = start + marker.length
  const tail = contract.slice(bodyStart)
  const next = tail.search(/\n {4}[A-Za-z0-9_]+:\n|\n {2}[a-zA-Z]+:\n/)
  return next < 0 ? tail : tail.slice(0, next)
}

function pathBlock(pathName) {
  const marker = `\n  ${pathName}:\n`
  const start = contract.indexOf(marker)
  if (start < 0) {
    console.error(`Unable to inspect OpenAPI path: ${pathName}`)
    process.exit(1)
  }
  const bodyStart = start + marker.length
  const tail = contract.slice(bodyStart)
  const next = tail.search(/\n {2}\/|\ncomponents:\n/)
  return next < 0 ? tail : tail.slice(0, next)
}

const previewRequest = schemaBlock('CvPreviewRequest')
for (const field of [
  'includedExperienceIds:',
  'includedProjectIds:',
  'includedCertificateIds:',
  'includedAwardIds:',
  'includedActivityIds:',
]) {
  if (!previewRequest.includes(field)) {
    console.error(`CvPreviewRequest is missing ${field}`)
    process.exit(1)
  }
}
if (previewRequest.includes('sectionOrder:') || previewRequest.includes('optionalSections:')) {
  console.error('CvPreviewRequest contains removed ordering/toggle fields')
  process.exit(1)
}

const uploadRequest = schemaBlock('AcademicLedgerUploadRequest')
for (const fragment of [
  'additionalProperties: false',
  '- file',
  'contentMediaType: text/csv',
  'x-max-size-bytes: 5242880',
]) {
  if (!uploadRequest.includes(fragment)) {
    console.error(`AcademicLedgerUploadRequest is missing: ${fragment}`)
    process.exit(1)
  }
}
if (uploadRequest.includes('academicYear:') || uploadRequest.includes('notes:')) {
  console.error('AcademicLedgerUploadRequest contains unfrozen optional metadata')
  process.exit(1)
}

const uploadPage = schemaBlock('PagedAcademicLedgerUploadResponse')
if (!uploadPage.includes('#/components/schemas/AcademicLedgerUploadSummaryResponse')) {
  console.error('PagedAcademicLedgerUploadResponse items are not typed')
  process.exit(1)
}
const validation = schemaBlock('AcademicLedgerValidationResultResponse')
if (
  !validation.includes('#/components/schemas/AcademicLedgerValidationErrorResponse') ||
  validation.includes('rowErrors:')
) {
  console.error('AcademicLedgerValidationResultResponse must use typed errors and no rowErrors')
  process.exit(1)
}
const studentSummary = schemaBlock('StudentSummaryResponse')
for (const fragment of ['degreeProgram:', 'academicBatch:', 'officialGpa:', '- officialGpa']) {
  if (!studentSummary.includes(fragment)) {
    console.error(`StudentSummaryResponse is missing: ${fragment}`)
    process.exit(1)
  }
}

const studentPath = pathBlock('/admin/students')
for (const fragment of [
  'RegisteredStudentLevel',
  'RegisteredStudentSort',
  'RegisteredStudentSearch',
]) {
  if (!studentPath.includes(fragment)) {
    console.error(`/admin/students is missing: ${fragment}`)
    process.exit(1)
  }
}
const uploadPath = pathBlock('/admin/academic-ledger/uploads')
for (const fragment of ["'202':", "'413':", "'415':", "'422':", 'text/csv']) {
  if (!uploadPath.includes(fragment)) {
    console.error(`Upload path is missing: ${fragment}`)
    process.exit(1)
  }
}
const commitPath = pathBlock('/admin/academic-ledger/uploads/{uploadId}/commit')
for (const fragment of ['x-access-role: ADMIN', 'x-audit-required: true', "'409':", "'422':"]) {
  if (!commitPath.includes(fragment)) {
    console.error(`Commit path is missing: ${fragment}`)
    process.exit(1)
  }
}
const downloadPath = pathBlock('/me/cv/download')
if (!downloadPath.includes('application/pdf:') || !downloadPath.includes('Content-Disposition:')) {
  console.error('/me/cv/download must remain PDF-only with Content-Disposition')
  process.exit(1)
}

const generatedExpectations = new Map([
  [
    'src/shared/api/generated/cvManagementApi.types.ts',
    [
      "version: '1.5.0'",
      'ApiCvRecordSelections',
      'ApiAcademicRecordResponse',
      'ApiAdminDashboardMetricsResponse',
      'ApiAcademicLedgerUploadStatus',
      'ApiAcademicLedgerValidationStatus',
      'ApiAcademicLedgerUploadSummaryResponse',
      'ApiAcademicLedgerUploadDetailResponse',
      'ApiPagedAcademicLedgerUploadResponse',
      'ApiAcademicLedgerStagedRowResponse',
      'ApiPagedAcademicLedgerStagedRowResponse',
      'ApiAcademicLedgerValidationErrorResponse',
      'ApiAcademicLedgerValidationResultResponse',
      'ApiAcademicLedgerCommitRequest',
      'ApiAcademicLedgerCommitResponse',
      'ApiStudentSummaryResponse',
      'ApiPagedStudentSummaryResponse',
      'ApiRegisteredStudentSort',
    ],
  ],
  [
    'src/shared/api/generated/cvManagementApi.client.ts',
    ["version: '1.5.0'", `contractPath: '${contractPath}'`],
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

console.log('OpenAPI v1.5.0 contract and deterministic Sprint 1-6 metadata are synchronized.')
