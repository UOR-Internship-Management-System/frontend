import { existsSync, readFileSync } from 'node:fs'

const contractPath = 'docs/api/CV_Management_API_OpenAPI_v1.0.yaml'
const clientPath = 'src/shared/api/generated/cvManagementApi.client.ts'
const typesPath = 'src/shared/api/generated/cvManagementApi.types.ts'

if (!existsSync(contractPath) || !existsSync(clientPath) || !existsSync(typesPath)) {
  console.error('OpenAPI contract or generated stubs are missing.')
  process.exitCode = 1
} else if (!readFileSync(contractPath, 'utf8').includes('openapi: 3.1.1')) {
  console.error('OpenAPI contract version is invalid.')
  process.exitCode = 1
} else {
  console.log('OpenAPI foundation check passed.')
}
