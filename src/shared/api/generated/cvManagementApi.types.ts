export type ApiContractMetadata = {
  title: string
  openapi: '3.1.1'
  version: '1.2.0'
  contractPath: 'docs/api/CV_Management_API_OpenAPI_v1.2.0.yaml'
}

export type ApiProblemDetails = {
  type: string
  title: string
  status: number
  code: string
  message: string
  correlationId: string
}
