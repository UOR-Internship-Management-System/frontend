import fs from 'node:fs'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'src/shared/api/generated')
fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(
  path.join(outDir, 'cvManagementApi.types.ts'),
  `export type ApiContractMetadata = {\n  title: string\n  openapi: '3.1.1'\n  version: '1.2.0'\n  contractPath: 'docs/api/CV_Management_API_OpenAPI_v1.2.0.yaml'\n}\n\nexport type ApiProblemDetails = {\n  type: string\n  title: string\n  status: number\n  code: string\n  message: string\n  correlationId: string\n}\n`,
)

fs.writeFileSync(
  path.join(outDir, 'cvManagementApi.client.ts'),
  `import type { ApiContractMetadata } from './cvManagementApi.types'\n\nexport const cvManagementApiContract: ApiContractMetadata = {\n  title: 'CV Management API',\n  openapi: '3.1.1',\n  version: '1.2.0',\n  contractPath: 'docs/api/CV_Management_API_OpenAPI_v1.2.0.yaml',\n}\n`,
)

console.log('Generated deterministic OpenAPI v1.2.0 metadata stubs.')
