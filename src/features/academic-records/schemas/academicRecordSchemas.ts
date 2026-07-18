import { z } from 'zod'
import type {
  ApiAcademicRecordResponse,
  ApiAcademicRecordSourceResponse,
  ApiGpaSummaryResponse,
  ApiPagedAcademicRecordResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

const uuidSchema = z.string().uuid()
const dateTimeSchema = z.string().datetime({ offset: true })

export const academicRecordSchema: z.ZodType<ApiAcademicRecordResponse> = z
  .object({
    academicRecordId: uuidSchema,
    subjectId: uuidSchema,
    courseCode: z.string().min(1).max(30),
    courseTitle: z.string().min(1).max(250),
    credits: z.number().min(0).multipleOf(0.1),
    letterGrade: z.string().min(1).max(5),
    gradePoint: z.number().min(0).max(4).multipleOf(0.01),
    semester: z.string().min(1).max(80),
    academicYear: z.string().min(1).max(30),
    attemptNumber: z.number().int().min(1),
    resultStatus: z.string().min(1).max(30),
    committedAt: dateTimeSchema,
  })
  .strict()

export const academicRecordSourceSchema: z.ZodType<ApiAcademicRecordSourceResponse> = z
  .object({
    sourceUploadId: uuidSchema,
    committedAt: dateTimeSchema,
  })
  .strict()

export const gpaAvailabilityStatusSchema = z.enum(['AVAILABLE', 'NOT_AVAILABLE'])

export const gpaSummarySchema: z.ZodType<ApiGpaSummaryResponse> = z
  .object({
    studentId: uuidSchema,
    status: gpaAvailabilityStatusSchema,
    computerScienceGpa: z.number().min(0).max(4).multipleOf(0.01).nullable(),
    totalCredits: z.number().min(0).multipleOf(0.1).nullable(),
    calculatedAt: dateTimeSchema.nullable(),
    source: academicRecordSourceSchema.nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    const values = [value.computerScienceGpa, value.totalCredits, value.calculatedAt, value.source]
    if (value.status === 'AVAILABLE' && values.some((item) => item === null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AVAILABLE requires GPA, credit, calculation, and source values.',
      })
    }
    if (value.status === 'NOT_AVAILABLE' && values.some((item) => item !== null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NOT_AVAILABLE requires unavailable values to be null.',
      })
    }
  })

export const pagedAcademicRecordsSchema: z.ZodType<ApiPagedAcademicRecordResponse> =
  createPagedResponseSchema(academicRecordSchema)
