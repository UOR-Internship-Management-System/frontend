import { z } from 'zod'
import type {
  ApiAcademicLedgerCommitResponse,
  ApiAcademicLedgerStagedRowResponse,
  ApiAcademicLedgerUploadDetailResponse,
  ApiAcademicLedgerUploadSummaryResponse,
  ApiAcademicLedgerValidationErrorResponse,
  ApiAcademicLedgerValidationResultResponse,
  ApiPagedAcademicLedgerStagedRowResponse,
  ApiPagedAcademicLedgerUploadResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createFileSchema } from '../../../shared/validation/fileSchemas'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

const uuidSchema = z.string().uuid()
const dateTimeSchema = z.string().datetime({ offset: true })
const nonnegativeInteger = z.number().int().nonnegative()

export const ledgerUploadStatusSchema = z.enum([
  'RECEIVED',
  'PROCESSING',
  'STAGED',
  'READY_TO_COMMIT',
  'COMMITTING',
  'COMMITTED',
  'VALIDATION_FAILED',
  'PROCESSING_FAILED',
])
export const ledgerValidationStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'PASSED',
  'FAILED',
])
export const ledgerRowValidationStatusSchema = z.enum(['VALID', 'WARNING', 'INVALID'])
export const ledgerValidationSeveritySchema = z.enum(['ERROR', 'WARNING'])

export const ledgerValidationErrorSchema: z.ZodType<ApiAcademicLedgerValidationErrorResponse> = z
  .object({
    rowNumber: z.number().int().positive(),
    field: z.string().min(1).max(120).nullable(),
    code: z.string().min(1).max(120),
    message: z.string().min(1).max(500),
    severity: ledgerValidationSeveritySchema,
    rejectedValue: z.string().max(500).nullable(),
    relatedRowNumber: z.number().int().positive().nullable(),
  })
  .strict()

const ledgerUploadSummaryObject = z
  .object({
    uploadId: uuidSchema,
    originalFilename: z.string().min(1).max(255),
    contentType: z.literal('text/csv'),
    fileSizeBytes: z.number().int().positive().max(5_242_880),
    uploadStatus: ledgerUploadStatusSchema,
    validationStatus: ledgerValidationStatusSchema,
    totalRows: nonnegativeInteger,
    validRows: nonnegativeInteger,
    invalidRows: nonnegativeInteger,
    uploadedAt: dateTimeSchema,
    committedAt: dateTimeSchema.nullable(),
    failureSummary: z.string().max(1000).nullable(),
  })
  .strict()

export const ledgerUploadSummarySchema: z.ZodType<ApiAcademicLedgerUploadSummaryResponse> =
  ledgerUploadSummaryObject

export const ledgerUploadDetailSchema: z.ZodType<ApiAcademicLedgerUploadDetailResponse> =
  ledgerUploadSummaryObject
    .extend({
      statusMessage: z.string().min(1).max(500),
      nextPollAfterSeconds: z.number().int().min(1).max(30).nullable(),
    })
    .strict()

export const pagedLedgerUploadsSchema: z.ZodType<ApiPagedAcademicLedgerUploadResponse> =
  createPagedResponseSchema(ledgerUploadSummarySchema)

export const ledgerStagedRowSchema: z.ZodType<ApiAcademicLedgerStagedRowResponse> = z
  .object({
    stagingRowId: uuidSchema,
    uploadId: uuidSchema,
    rowNumber: z.number().int().positive(),
    studentIndexNumber: z.string().min(1).max(60),
    studentId: uuidSchema.nullable(),
    courseCode: z.string().min(1).max(30),
    courseTitle: z.string().min(1).max(250).nullable(),
    credits: z.number().min(0).multipleOf(0.1),
    letterGrade: z.string().min(1).max(5),
    gradePoint: z.number().min(0).max(4).multipleOf(0.01).nullable(),
    semester: z.string().min(1).max(80),
    academicYear: z.string().min(1).max(30),
    attemptNumber: z.number().int().positive(),
    resultStatus: z.string().min(1).max(30),
    validationStatus: ledgerRowValidationStatusSchema,
    validationErrors: z.array(ledgerValidationErrorSchema),
  })
  .strict()

export const pagedLedgerStagedRowsSchema: z.ZodType<ApiPagedAcademicLedgerStagedRowResponse> =
  createPagedResponseSchema(ledgerStagedRowSchema)

export const ledgerValidationResultSchema: z.ZodType<ApiAcademicLedgerValidationResultResponse> = z
  .object({
    uploadId: uuidSchema,
    validationStatus: ledgerValidationStatusSchema,
    valid: z.boolean(),
    totalRows: nonnegativeInteger,
    validRows: nonnegativeInteger,
    invalidRows: nonnegativeInteger,
    errors: z.array(ledgerValidationErrorSchema),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.totalRows !== value.validRows + value.invalidRows) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Validation row totals are inconsistent.',
      })
    }
    if (value.valid && (value.validationStatus !== 'PASSED' || value.invalidRows !== 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A valid result must be passed with no invalid rows.',
      })
    }
  })

export const ledgerCommitResponseSchema: z.ZodType<ApiAcademicLedgerCommitResponse> = z
  .object({
    uploadId: uuidSchema,
    status: z.literal('COMMITTED'),
    committedRecords: nonnegativeInteger,
    affectedStudents: nonnegativeInteger,
    recalculatedGpaCount: nonnegativeInteger,
    committedAt: dateTimeSchema,
  })
  .strict()

export const academicLedgerFileSchema = createFileSchema({
  extensions: ['.csv'],
  maxBytes: 5_242_880,
  allowedMimeTypes: ['text/csv'],
  allowEmptyMimeType: true,
})
