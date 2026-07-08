import fs from 'node:fs'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'src/shared/api/generated')
fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(
  path.join(outDir, 'cvManagementApi.types.ts'),
  `export type ApiContractMetadata = {\\n  title: string\\n  openapi: '3.1.1'\\n}\\n\\nexport type ApiProblemDetails = {\\n  title: string\\n  status: number\\n  detail?: string\\n}\\n`,
)

fs.writeFileSync(
  path.join(outDir, 'cvManagementApi.client.ts'),
  `import type { ApiContractMetadata } from './cvManagementApi.types'\\n\\nexport const cvManagementApiContract: ApiContractMetadata = {\\n  title: 'CV Management API',\\n  openapi: '3.1.1',\\n}\\n`,
)

console.log('Generated deterministic Sprint 1 API stubs.')
