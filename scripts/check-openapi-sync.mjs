import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractPath = 'docs/api/CV_Management_API_OpenAPI_v1.2.0.yaml'
const requiredFiles = [
  contractPath,
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

const contract = fs.readFileSync(path.join(root, contractPath), 'utf8')
if (!contract.trimStart().startsWith('openapi: 3.1.1')) {
  console.error('OpenAPI contract must start with openapi: 3.1.1')
  process.exit(1)
}

if (!/^info:\s*$[\s\S]*?^ {2}version: 1\.2\.0\s*$/m.test(contract)) {
  console.error('OpenAPI info.version must be 1.2.0')
  process.exit(1)
}

const requiredProfilePaths = [
  '/me/profile:',
  '/me/profile/upload-policy:',
  '/me/profile/photo:',
  '/me/profile/contact-links:',
  '/me/profile/contact-links/{contactLinkId}:',
  '/me/profile/certificates:',
  '/me/profile/certificates/{certificateId}:',
  '/me/profile/certificates/{certificateId}/evidence:',
  '/me/profile/awards:',
  '/me/profile/awards/{awardId}:',
  '/me/profile/activities:',
  '/me/profile/activities/{activityId}:',
  '/me/profile/experience:',
  '/me/profile/experience/{experienceId}:',
]

const requiredProfileSchemas = [
  'StudentProfileResponse:',
  'StudentProfileUpdateRequest:',
  'ProfileUploadPolicyResponse:',
  'FileAssetResponse:',
  'ContactLinkResponse:',
  'CertificateResponse:',
  'AwardResponse:',
  'ActivityResponse:',
  'ExperienceResponse:',
]

for (const requiredFragment of [...requiredProfilePaths, ...requiredProfileSchemas]) {
  if (!contract.includes(requiredFragment)) {
    console.error(
      `OpenAPI contract is missing required Sprint 3 Profile contract: ${requiredFragment}`,
    )
    process.exit(1)
  }
}

for (const file of requiredFiles.filter((item) => item.endsWith('.ts'))) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  if (!source.includes('export')) {
    console.error(`Generated TypeScript artifact has no exports: ${file}`)
    process.exit(1)
  }

  if (!source.includes("version: '1.2.0'")) {
    console.error(`Generated metadata does not reference API version 1.2.0: ${file}`)
    process.exit(1)
  }
}

console.log('OpenAPI v1.2.0 contract and deterministic metadata are synchronized.')
