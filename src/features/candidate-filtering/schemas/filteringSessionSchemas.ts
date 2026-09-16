import { z } from 'zod'

/**
 * Schemas for the current Admin's single in-progress Candidate Filtering session.
 *
 * These endpoints are not part of the generated OpenAPI client (that contract is locked and
 * synchronized separately), so the request/response shapes are declared here directly rather
 * than typed against a generated `Api*` type.
 */
export const adminFilteringSessionUpsertRequestSchema = z
  .object({
    filterRunId: z.string().uuid(),
    selectedStudentIds: z.array(z.string().uuid()).max(100),
  })
  .strict()

export const adminFilteringSessionResponseSchema = z
  .object({
    internshipRequestId: z.string().uuid(),
    filterRunId: z.string().uuid(),
    selectedStudentIds: z.array(z.string().uuid()),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

export type AdminFilteringSessionUpsertRequest = z.infer<
  typeof adminFilteringSessionUpsertRequestSchema
>
export type AdminFilteringSession = z.infer<typeof adminFilteringSessionResponseSchema>
