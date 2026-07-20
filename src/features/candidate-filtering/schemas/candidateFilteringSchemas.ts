import { z } from 'zod'
import type {
  ApiCandidateFilteringCandidateResponse,
  ApiCandidateFilteringCriteriaRequest,
  ApiCandidateFilteringCriteriaResponse,
  ApiCandidateFilteringRunResponse,
  ApiDeclaredSkillResponse,
  ApiPagedCandidateFilteringCandidateResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'
import { internshipRequestSummaryResponseSchema } from '../../internship-management/schemas/internshipSchemas'

const uuidListSchema = z
  .array(z.string().uuid())
  .max(100)
  .refine((values) => new Set(values).size === values.length, 'Select each skill only once.')

const gpaValueSchema = z
  .number()
  .min(0)
  .max(4)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < Number.EPSILON * 100,
    'GPA values may use at most two decimal places.',
  )

export const filterSkillMatchModeSchema = z.enum(['AND', 'OR'])
export const candidateSortSchema = z.enum([
  'officialGpa,desc',
  'officialGpa,asc',
  'fullName,asc',
  'indexNumber,asc',
])

const criteriaFields = {
  requestId: z.string().uuid(),
  runtimeGpaLowerBound: gpaValueSchema.optional(),
  runtimeGpaUpperBound: gpaValueSchema.optional(),
  requestSkillIds: uuidListSchema.optional(),
  additionalSkillIds: uuidListSchema.optional(),
  skillMatchMode: filterSkillMatchModeSchema,
}

function boundsAreOrdered(value: {
  runtimeGpaLowerBound?: number | null
  runtimeGpaUpperBound?: number | null
}) {
  return (
    value.runtimeGpaLowerBound == null ||
    value.runtimeGpaUpperBound == null ||
    value.runtimeGpaLowerBound <= value.runtimeGpaUpperBound
  )
}

export const candidateFilteringCriteriaRequestSchema: z.ZodType<ApiCandidateFilteringCriteriaRequest> =
  z
    .object(criteriaFields)
    .strict()
    .refine(boundsAreOrdered, {
      message: 'Minimum GPA cannot exceed maximum GPA.',
      path: ['runtimeGpaUpperBound'],
    })

export const candidateFilteringCriteriaResponseSchema: z.ZodType<ApiCandidateFilteringCriteriaResponse> =
  z
    .object({
      requestId: criteriaFields.requestId,
      runtimeGpaLowerBound: gpaValueSchema.nullable(),
      runtimeGpaUpperBound: gpaValueSchema.nullable(),
      requestSkillIds: uuidListSchema,
      additionalSkillIds: uuidListSchema,
      skillMatchMode: filterSkillMatchModeSchema,
    })
    .strict()
    .refine(boundsAreOrdered, {
      message: 'Minimum GPA cannot exceed maximum GPA.',
      path: ['runtimeGpaUpperBound'],
    })

const declaredSkillSchema: z.ZodType<ApiDeclaredSkillResponse> = z
  .object({
    declaredSkillId: z.string().uuid(),
    skillId: z.string().uuid(),
    skillName: z.string().min(1),
    competencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const candidateFilteringCandidateResponseSchema: z.ZodType<ApiCandidateFilteringCandidateResponse> =
  z
    .object({
      studentId: z.string().uuid(),
      indexNumber: z.string().min(1),
      fullName: z.string().min(1),
      officialGpa: z.number().min(0).max(4).nullable(),
      gpaAvailabilityStatus: z.enum(['AVAILABLE', 'NOT_AVAILABLE']),
      matchingDeclaredSkills: z.array(declaredSkillSchema),
      declaredSkillCount: z.number().int().nonnegative(),
      hasLatestSavedCv: z.boolean(),
      hasExistingActiveShortlist: z.boolean(),
      existingActiveShortlistCount: z.number().int().nonnegative(),
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

export const candidateFilteringRunResponseSchema: z.ZodType<ApiCandidateFilteringRunResponse> = z
  .object({
    filterRunId: z.string().uuid(),
    request: internshipRequestSummaryResponseSchema,
    criteria: candidateFilteringCriteriaResponseSchema,
    candidateCount: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const pagedCandidateFilteringCandidateResponseSchema: z.ZodType<ApiPagedCandidateFilteringCandidateResponse> =
  createPagedResponseSchema(candidateFilteringCandidateResponseSchema)
