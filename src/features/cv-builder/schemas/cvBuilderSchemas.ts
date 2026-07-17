import { z } from 'zod'
import type {
  ApiCvFreshnessResponse,
  ApiCvPreviewConfigurationResponse,
  ApiCvPreviewRequest,
  ApiCvPreviewResponse,
  ApiCvVersionCreateRequest,
  ApiCvVersionResponse,
  ApiGeneratedFileMetadataResponse,
  ApiPagedCvVersionResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

export const cvFreshnessStatusSchema = z.enum(['NOT_SAVED', 'CURRENT', 'OUTDATED'])
export const cvSourceAreaSchema = z.enum([
  'PROFILE',
  'DECLARED_SKILLS',
  'PROJECTS',
  'ACADEMIC_RECORDS',
])
export const cvSectionTypeSchema = z.enum([
  'PROFESSIONAL_SUMMARY',
  'SKILLS',
  'EXPERIENCE',
  'PROJECTS',
  'CERTIFICATES',
  'AWARDS',
  'ACTIVITIES',
  'ACADEMIC_SUMMARY',
])

const uuidSchema = z.string().uuid()
const dateTimeSchema = z.string().datetime({ offset: true })
const uniqueUuidListSchema = z.array(uuidSchema).superRefine(requireUnique('Project IDs'))
const sectionOrderSchema = z
  .array(cvSectionTypeSchema)
  .min(1)
  .max(8)
  .superRefine(requireUnique('CV sections'))

export const cvFreshnessSchema: z.ZodType<ApiCvFreshnessResponse> = z
  .object({
    status: cvFreshnessStatusSchema,
    changedAreas: z.array(cvSourceAreaSchema).superRefine(requireUnique('Changed source areas')),
    latestSavedCvVersionId: uuidSchema.nullable(),
    latestSavedAt: dateTimeSchema.nullable(),
    evaluatedAt: dateTimeSchema,
    message: z.string().min(1),
  })
  .strict()
  .superRefine((value, context) => {
    const hasSavedVersion = value.latestSavedCvVersionId !== null && value.latestSavedAt !== null
    if (value.status === 'NOT_SAVED') {
      if (
        hasSavedVersion ||
        value.latestSavedCvVersionId !== null ||
        value.latestSavedAt !== null
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'NOT_SAVED cannot reference a saved CV.',
        })
      }
      if (value.changedAreas.length > 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'NOT_SAVED cannot have changed areas.',
        })
      }
      return
    }

    if (!hasSavedVersion) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Saved CV metadata is required.' })
    }
    if (value.status === 'CURRENT' && value.changedAreas.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CURRENT cannot have changed areas.',
      })
    }
    if (value.status === 'OUTDATED' && value.changedAreas.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'OUTDATED requires a changed area.',
      })
    }
  })

export const cvPreviewRequestSchema: z.ZodType<ApiCvPreviewRequest> = z
  .object({
    sectionOrder: sectionOrderSchema,
    includedProjectIds: uniqueUuidListSchema,
  })
  .strict()

export const cvPreviewConfigurationSchema: z.ZodType<ApiCvPreviewConfigurationResponse> =
  cvPreviewRequestSchema

export const cvPreviewSchema: z.ZodType<ApiCvPreviewResponse> = z
  .object({
    previewId: uuidSchema,
    htmlPreview: z.string().min(1),
    latexSource: z.string().min(1),
    freshness: cvFreshnessSchema,
    configuration: cvPreviewConfigurationSchema,
    generatedAt: dateTimeSchema,
    expiresAt: dateTimeSchema,
  })
  .strict()

export const cvVersionCreateRequestSchema: z.ZodType<ApiCvVersionCreateRequest> = z
  .object({ previewId: uuidSchema })
  .strict()

export const generatedPdfFileSchema: z.ZodType<ApiGeneratedFileMetadataResponse> = z
  .object({
    fileName: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[A-Za-z0-9._-]+\.pdf$/),
    mediaType: z.literal('application/pdf'),
    fileSizeBytes: z.number().int().min(1),
    generatedAt: dateTimeSchema,
  })
  .strict()

const apiRelativeDownloadUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\') &&
      !/\s/.test(value),
    'Use a safe API-relative download URL.',
  )

export const cvVersionSchema: z.ZodType<ApiCvVersionResponse> = z
  .object({
    cvVersionId: uuidSchema,
    versionNumber: z.number().int().min(1),
    versionLabel: z.string().min(1),
    latest: z.boolean(),
    createdAt: dateTimeSchema,
    generatedAt: dateTimeSchema,
    savedAt: dateTimeSchema,
    downloadUrl: apiRelativeDownloadUrlSchema,
    freshnessStatus: z.enum(['CURRENT', 'OUTDATED']),
    pdfFile: generatedPdfFileSchema,
  })
  .strict()

export const pagedCvVersionsSchema: z.ZodType<ApiPagedCvVersionResponse> =
  createPagedResponseSchema(cvVersionSchema)

function requireUnique(label: string) {
  return (values: readonly string[], context: z.RefinementCtx) => {
    if (new Set(values).size !== values.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be unique.` })
    }
  }
}
