import { z } from 'zod'
import type {
  ApiBulkCvExportCreateRequest,
  ApiExportJobResponse,
  ApiExportWarningResponse,
  ApiMissingCvStudentResponse,
  ApiShortlistSummaryExportCreateRequest,
} from '../../../shared/api/generated/cvManagementApi.types'

export const exportJobStatusSchema = z.enum([
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
])

export const shortlistSummaryExportCreateRequestSchema: z.ZodType<ApiShortlistSummaryExportCreateRequest> =
  z.object({ format: z.literal('CSV') }).strict()

export const bulkCvExportCreateRequestSchema: z.ZodType<ApiBulkCvExportCreateRequest> = z
  .object({ format: z.literal('ZIP') })
  .strict()

export const missingCvStudentResponseSchema: z.ZodType<ApiMissingCvStudentResponse> = z
  .object({
    studentId: z.string().uuid(),
    indexNumber: z.string().min(1).max(50),
    fullName: z.string().min(1).max(200),
  })
  .strict()

export const exportWarningResponseSchema: z.ZodType<ApiExportWarningResponse> = z
  .object({
    code: z.enum(['MISSING_CVS', 'PARTIAL_EXPORT']),
    message: z.string().min(1).max(500),
  })
  .strict()

export const exportJobResponseSchema: z.ZodType<ApiExportJobResponse> = z
  .object({
    exportJobId: z.string().uuid(),
    shortlistId: z.string().uuid(),
    exportType: z.enum(['SHORTLIST_SUMMARY_CSV', 'BULK_LATEST_CV_ZIP']),
    format: z.enum(['CSV', 'ZIP']),
    status: exportJobStatusSchema,
    totalCandidateCount: z.number().int().nonnegative(),
    includedFileCount: z.number().int().nonnegative(),
    missingCvCount: z.number().int().nonnegative(),
    missingCvStudents: z.array(missingCvStudentResponseSchema),
    warnings: z.array(exportWarningResponseSchema),
    downloadReady: z.boolean(),
    downloadUrl: z.string().max(500).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    startedAt: z.string().datetime({ offset: true }).nullable(),
    completedAt: z.string().datetime({ offset: true }).nullable(),
    expiresAt: z.string().datetime({ offset: true }).nullable(),
    failureCode: z.string().max(100).nullable(),
    failureMessage: z.string().max(500).nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.missingCvCount !== value.missingCvStudents.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Missing CV count must match the missing Student list.',
        path: ['missingCvCount'],
      })
    }
    if (value.includedFileCount > value.totalCandidateCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Included file count cannot exceed the candidate count.',
        path: ['includedFileCount'],
      })
    }
    if (value.downloadReady !== (value.status === 'COMPLETED' && value.downloadUrl !== null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Download readiness must agree with completed job metadata.',
        path: ['downloadReady'],
      })
    }
    if (value.exportType === 'SHORTLIST_SUMMARY_CSV' && value.format !== 'CSV') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Summary exports require CSV.',
        path: ['format'],
      })
    }
    if (value.exportType === 'BULK_LATEST_CV_ZIP' && value.format !== 'ZIP') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bulk CV exports require ZIP.',
        path: ['format'],
      })
    }
    if (
      value.status === 'COMPLETED' &&
      value.exportType === 'BULK_LATEST_CV_ZIP' &&
      value.includedFileCount === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A completed bulk CV export must contain at least one file.',
        path: ['includedFileCount'],
      })
    }
  })
