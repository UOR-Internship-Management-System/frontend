export type FieldError = {
  field: string
  code?: string
  message: string
}

export type ProblemDetails = {
  type: string
  title: string
  status: number
  code: string
  message: string
  correlationId: string
  fieldErrors?: FieldError[]
  details?: Record<string, unknown>
}
