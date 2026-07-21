import { z } from 'zod'
import type {
  ApiPagedShortlistCandidateResponse,
  ApiPagedShortlistResponse,
  ApiShortlistCandidateMutationResponse,
  ApiShortlistCandidateRequest,
  ApiShortlistCandidateResponse,
  ApiShortlistCreateRequest,
  ApiShortlistDetailResponse,
  ApiShortlistFinalizeRequest,
  ApiShortlistFinalizeResponse,
  ApiShortlistResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'
import { internshipRequestSummaryResponseSchema } from '../../internship-management/schemas/internshipSchemas'

export const shortlistStatusSchema = z.enum(['DRAFT', 'FINALIZED'])

export const shortlistSortSchema = z.enum([
  'updatedAt,desc',
  'createdAt,desc',
  'companyName,asc',
  'roleTitle,asc',
])

export const shortlistCandidateSortSchema = z.enum([
  'officialGpa,desc',
  'officialGpa,asc',
  'fullName,asc',
  'indexNumber,asc',
])

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

export const shortlistCandidateResponseSchema: z.ZodType<ApiShortlistCandidateResponse> = z
  .object({
    studentId: z.string().uuid(),
    indexNumber: z.string().min(1),
    fullName: z.string().min(1),
    officialGpa: z.number().min(0).max(4).multipleOf(0.01).nullable(),
    gpaAvailabilityStatus: z.enum(['AVAILABLE', 'NOT_AVAILABLE']),
    hasLatestSavedCv: z.boolean(),
    hasExistingActiveShortlist: z.boolean(),
    existingActiveShortlistCount: z.number().int().nonnegative(),
    selectedAt: z.string().datetime({ offset: true }),
    selectionNote: z.string().max(1000).nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    const hasGpa = value.officialGpa !== null

    if ((value.gpaAvailabilityStatus === 'AVAILABLE') !== hasGpa) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'GPA availability must agree with the GPA value.',
        path: ['gpaAvailabilityStatus'],
      })
    }

    if (value.hasExistingActiveShortlist !== value.existingActiveShortlistCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Active-shortlist availability must agree with its count.',
        path: ['hasExistingActiveShortlist'],
      })
    }
  })

export const pagedShortlistCandidateResponseSchema: z.ZodType<ApiPagedShortlistCandidateResponse> =
  createPagedResponseSchema(shortlistCandidateResponseSchema)

export const shortlistResponseSchema: z.ZodType<ApiShortlistResponse> = z
  .object({
    shortlistId: z.string().uuid(),
    request: internshipRequestSummaryResponseSchema,
    filterRunId: z.string().uuid().nullable(),
    name: z.string().max(200).nullable(),
    status: shortlistStatusSchema,
    guidanceValue: z.number().int().nonnegative().nullable(),
    selectedCandidateCount: z.number().int().nonnegative(),
    guidanceExceeded: z.boolean(),
    guidanceWarning: z.string().max(500).nullable(),
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    finalizedAt: z.string().datetime({ offset: true }).nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.status === 'DRAFT' && value.finalizedAt !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A draft shortlist cannot have a finalization timestamp.',
        path: ['finalizedAt'],
      })
    }

    if (value.status === 'FINALIZED' && value.finalizedAt === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A finalized shortlist must include its finalization timestamp.',
        path: ['finalizedAt'],
      })
    }
  })

export const pagedShortlistResponseSchema: z.ZodType<ApiPagedShortlistResponse> =
  createPagedResponseSchema(shortlistResponseSchema)

export const shortlistDetailResponseSchema: z.ZodType<ApiShortlistDetailResponse> = z
  .object({
    shortlist: shortlistResponseSchema,
    candidates: pagedShortlistCandidateResponseSchema,
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

export const shortlistFinalizeRequestSchema: z.ZodType<ApiShortlistFinalizeRequest> = z
  .object({
    acknowledgeGuidanceWarning: z.boolean(),
    finalizationNote: z.string().trim().max(1000).nullable().optional(),
  })
  .strict()

export const shortlistFinalizeResponseSchema: z.ZodType<ApiShortlistFinalizeResponse> = z
  .object({
    shortlistId: z.string().uuid(),
    status: z.literal('FINALIZED'),
    selectedCandidateCount: z.number().int().min(1),
    guidanceValue: z.number().int().nonnegative().nullable(),
    guidanceExceeded: z.boolean(),
    guidanceAcknowledged: z.boolean(),
    version: z.number().int().nonnegative(),
    finalizedAt: z.string().datetime({ offset: true }),
  })
  .strict()
