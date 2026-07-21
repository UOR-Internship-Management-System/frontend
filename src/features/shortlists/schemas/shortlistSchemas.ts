import { z } from 'zod'
import type {
  ApiShortlistCandidateMutationResponse,
  ApiShortlistCandidateRequest,
  ApiShortlistCreateRequest,
  ApiShortlistResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { internshipRequestSummaryResponseSchema } from '../../internship-management/schemas/internshipSchemas'

export const shortlistCreateRequestSchema: z.ZodType<ApiShortlistCreateRequest> = z
  .object({
    requestId: z.string().uuid(),
    filterRunId: z.string().uuid().nullable().optional(),
    name: z.string().trim().max(200).nullable().optional(),
  })
  .strict()

export const shortlistCandidateRequestSchema: z.ZodType<ApiShortlistCandidateRequest> = z
  .object({
    studentIds: z
      .array(z.string().uuid())
      .min(1)
      .max(100)
      .refine((values) => new Set(values).size === values.length, 'Select each Student only once.'),
    note: z.string().trim().max(1000).nullable().optional(),
  })
  .strict()

export const shortlistResponseSchema: z.ZodType<ApiShortlistResponse> = z
  .object({
    shortlistId: z.string().uuid(),
    request: internshipRequestSummaryResponseSchema,
    filterRunId: z.string().uuid().nullable(),
    name: z.string().max(200).nullable(),
    status: z.enum(['DRAFT', 'FINALIZED']),
    guidanceValue: z.number().int().nonnegative().nullable(),
    selectedCandidateCount: z.number().int().nonnegative(),
    guidanceExceeded: z.boolean(),
    guidanceWarning: z.string().nullable(),
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    finalizedAt: z.string().datetime({ offset: true }).nullable(),
  })
  .strict()

export const shortlistCandidateMutationResponseSchema: z.ZodType<ApiShortlistCandidateMutationResponse> =
  z
    .object({
      shortlistId: z.string().uuid(),
      addedCount: z.number().int().nonnegative(),
      alreadyPresentCount: z.number().int().nonnegative(),
      removedCount: z.number().int().nonnegative(),
      selectedCandidateCount: z.number().int().nonnegative(),
      guidanceExceeded: z.boolean(),
      version: z.number().int().nonnegative(),
    })
    .strict()
