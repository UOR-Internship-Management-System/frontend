import { z } from 'zod'
import type {
  ApiAcademicRecordResponse,
  ApiPagedAcademicRecordResponse,
  ApiPagedStudentSummaryResponse,
  ApiStudentSummaryResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

const uuidSchema = z.string().uuid()
const dateTimeSchema = z.string().datetime({ offset: true })

export const registeredStudentSchema: z.ZodType<ApiStudentSummaryResponse> = z
  .object({
    studentId: uuidSchema,
    indexNumber: z.string().min(1).max(60),
    fullName: z.string().min(1).max(250),
    universityEmail: z.string().email().max(320),
    degreeProgram: z.string().min(1).max(250),
    academicBatch: z.string().regex(/^\d{4}$/),
    currentLevel: z.union([z.literal(3), z.literal(4)]),
    officialGpa: z.number().min(0).max(4).multipleOf(0.01).nullable(),
  })
  .strict()

export const adminAcademicRecordSchema: z.ZodType<ApiAcademicRecordResponse> = z
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

export const pagedRegisteredStudentsSchema: z.ZodType<ApiPagedStudentSummaryResponse> =
  createPagedResponseSchema(registeredStudentSchema)

export const pagedAdminAcademicRecordsSchema: z.ZodType<ApiPagedAcademicRecordResponse> =
  createPagedResponseSchema(adminAcademicRecordSchema)
