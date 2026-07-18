import { z } from 'zod'
import type {
  ApiCvFreshnessResponse,
  ApiCvPreviewConfigurationResponse,
  ApiCvPreviewRequest,
  ApiCvPreviewResponse,
  ApiCvSaveRequest,
  ApiCvResponse,
  ApiGeneratedFileMetadataResponse,
} from '../../../shared/api/generated/cvManagementApi.types'

export const cvFreshnessStatusSchema = z.enum(['NOT_SAVED', 'CURRENT', 'OUTDATED'])
export const cvSourceAreaSchema = z.enum([
  'PROFILE',
  'DECLARED_SKILLS',
  'PROJECTS',
  'ACADEMIC_RECORDS',
])
const uuidSchema = z.string().uuid()
const dateTimeSchema = z.string().datetime({ offset: true })
const selectedRecordIdsSchema = (label: string) =>
  z.array(uuidSchema).max(100).superRefine(requireUnique(label))

export const cvFreshnessSchema: z.ZodType<ApiCvFreshnessResponse> = z
  .object({
    status: cvFreshnessStatusSchema,
    changedAreas: z.array(cvSourceAreaSchema).superRefine(requireUnique('Changed source areas')),
    cvId: uuidSchema.nullable(),
    savedAt: dateTimeSchema.nullable(),
    evaluatedAt: dateTimeSchema,
    message: z.string().min(1),
  })
  .strict()
  .superRefine((value, context) => {
    const hasSavedCv = value.cvId !== null && value.savedAt !== null
    if (value.status === 'NOT_SAVED') {
      if (hasSavedCv || value.cvId !== null || value.savedAt !== null) {
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

    if (!hasSavedCv) {
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
    includedExperienceIds: selectedRecordIdsSchema('Experience IDs'),
    includedProjectIds: selectedRecordIdsSchema('Project IDs'),
    includedCertificateIds: selectedRecordIdsSchema('Certificate IDs'),
    includedAwardIds: selectedRecordIdsSchema('Award IDs'),
    includedActivityIds: selectedRecordIdsSchema('Activity IDs'),
  })
  .strict()

export const cvPreviewConfigurationSchema: z.ZodType<ApiCvPreviewConfigurationResponse> =
  cvPreviewRequestSchema

export const cvPreviewSchema: z.ZodType<ApiCvPreviewResponse> = z
  .object({
    previewId: uuidSchema,
    htmlPreview: z.string().min(1),
    freshness: cvFreshnessSchema,
    configuration: cvPreviewConfigurationSchema,
    generatedAt: dateTimeSchema,
    expiresAt: dateTimeSchema,
  })
  .strict()

export const cvSaveRequestSchema: z.ZodType<ApiCvSaveRequest> = z
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

export const cvSchema: z.ZodType<ApiCvResponse> = z
  .object({
    cvId: uuidSchema,
    revision: z.number().int().min(1),
    createdAt: dateTimeSchema,
    generatedAt: dateTimeSchema,
    savedAt: dateTimeSchema,
    downloadUrl: apiRelativeDownloadUrlSchema,
    freshnessStatus: z.enum(['CURRENT', 'OUTDATED']),
    configuration: cvPreviewConfigurationSchema,
    pdfFile: generatedPdfFileSchema,
  })
  .strict()

function requireUnique(label: string) {
  return (values: readonly string[], context: z.RefinementCtx) => {
    if (new Set(values).size !== values.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be unique.` })
    }
  }
}
