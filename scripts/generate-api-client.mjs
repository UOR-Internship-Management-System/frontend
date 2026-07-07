import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('src/shared/api/generated', { recursive: true })
writeFileSync('src/shared/api/generated/cvManagementApi.types.ts', "export interface ApiOperationStub {\n  readonly operationId: string\n}\n")
writeFileSync('src/shared/api/generated/cvManagementApi.client.ts', "import { type ApiOperationStub } from './cvManagementApi.types'\n\nexport const cvManagementApiClient: ApiOperationStub = { operationId: 'sprintOneGeneratedClientStub' }\n")
console.log('API stubs generated.')
