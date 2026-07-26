import { z } from 'zod'
import type {
  ApiAcademicRecordResponse,
  ApiActivityResponse,
  ApiAdminLatestCvResponse,
  ApiAdminStudentCvSupportingDataResponse,
  ApiAdminStudentDetailResponse,
  ApiAwardResponse,
  ApiCertificateResponse,
  ApiDeclaredSkillResponse,
  ApiExperienceResponse,
  ApiFileAssetResponse,
  ApiGpaSummaryResponse,
  ApiPagedAcademicRecordResponse,
  ApiPagedResponse,
  ApiPagedStudentSummaryResponse,
  ApiProjectResponse,
  ApiStudentProfileResponse,
  ApiStudentSummaryResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

const uuidSchema = z.string().uuid()
const dateTimeSchema = z.string().datetime({ offset: true })
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const isoDateSchema = z.string().refine((value) => {
  if (!isoDatePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}, 'Use a valid ISO date.')
const officialGpaSchema = z.number().min(0).max(4).multipleOf(0.01)
const safeWebUrlSchema = z
  .string()
  .url()
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'URL must use HTTP or HTTPS.',
  })

function validateDateRange(
  values: { startDate: string | null; endDate: string | null },
  context: z.RefinementCtx,
) {
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date cannot be before start date.',
    })
  }
}

export const registeredStudentSchema: z.ZodType<ApiStudentSummaryResponse> = z
  .object({
    studentId: uuidSchema,
    indexNumber: z.string().min(1).max(40),
    fullName: z.string().min(1).max(200),
    universityEmail: z.string().email().max(254),
    degreeProgram: z.string().min(1).max(160),
    academicBatch: z.string().regex(/^\d{4}$/),
    currentLevel: z.union([z.literal(3), z.literal(4)]),
    officialGpa: officialGpaSchema.nullable(),
  })
  .strict()

export const fileAssetSchema: z.ZodType<ApiFileAssetResponse> = z
  .object({
    fileId: uuidSchema,
    fileName: z.string().max(255),
    mimeType: z.string().max(120),
    fileSizeBytes: z.number().int().min(1),
    url: safeWebUrlSchema,
    createdAt: dateTimeSchema,
  })
  .strict()

export const adminStudentProfileSchema: z.ZodType<ApiStudentProfileResponse> = z
  .object({
    studentId: uuidSchema,
    fullName: z.string().min(1).max(150),
    indexNumber: z.string().min(1).max(30),
    universityEmail: z.string().email().max(254),
    degreeProgramme: z.string(),
    studentLevel: z.union([z.literal(3), z.literal(4)]),
    cohortYear: z.number().int().nullable(),
    personalEmail: z.string().email().max(254).nullable(),
    headline: z.string().max(200).nullable(),
    summary: z.string().nullable(),
    phone: z.string().max(30).nullable(),
    location: z.string().max(150).nullable(),
    profilePhoto: fileAssetSchema.nullable(),
    version: z.number().int().nonnegative(),
    updatedAt: dateTimeSchema,
    cvSourceUpdatedAt: dateTimeSchema,
  })
  .strict()

export const experienceSchema: z.ZodType<ApiExperienceResponse> = z
  .object({
    id: uuidSchema,
    organization: z.string().min(1).max(200),
    positionTitle: z.string().min(1).max(150),
    location: z.string().nullable(),
    startDate: isoDateSchema,
    endDate: isoDateSchema.nullable(),
    currentRole: z.boolean(),
    description: z.string().nullable(),
    cvInclude: z.boolean(),
    version: z.number().int().nonnegative(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict()
  .superRefine((value, context) => {
    validateDateRange(value, context)
    if (value.currentRole && value.endDate !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'A current role cannot have an end date.',
      })
    }
  })

export const certificateSchema: z.ZodType<ApiCertificateResponse> = z
  .object({
    id: uuidSchema,
    title: z.string().min(1).max(200),
    issuer: z.string().min(1).max(200),
    issueDate: isoDateSchema,
    credentialUrl: safeWebUrlSchema.nullable(),
    cvInclude: z.boolean(),
    evidence: fileAssetSchema.nullable(),
    version: z.number().int().nonnegative(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict()

export const awardSchema: z.ZodType<ApiAwardResponse> = z
  .object({
    id: uuidSchema,
    title: z.string().min(1).max(200),
    issuer: z.string().min(1).max(200),
    awardDate: isoDateSchema,
    description: z.string().nullable(),
    cvInclude: z.boolean(),
    version: z.number().int().nonnegative(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict()

export const activitySchema: z.ZodType<ApiActivityResponse> = z
  .object({
    id: uuidSchema,
    activityName: z.string().min(1).max(200),
    roleTitle: z.string().min(1).max(150),
    startDate: isoDateSchema.nullable(),
    endDate: isoDateSchema.nullable(),
    description: z.string().nullable(),
    cvInclude: z.boolean(),
    version: z.number().int().nonnegative(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict()
  .superRefine(validateDateRange)

export const adminStudentCvSupportingDataSchema: z.ZodType<ApiAdminStudentCvSupportingDataResponse> =
  z
    .object({
      experiences: z.array(experienceSchema),
      certificates: z.array(certificateSchema),
      awards: z.array(awardSchema),
      activities: z.array(activitySchema),
    })
    .strict()

const latestCvFields = {
  cvId: uuidSchema,
  revision: z.number().int().min(1),
  generatedAt: dateTimeSchema,
  savedAt: dateTimeSchema,
  freshnessStatus: z.enum(['CURRENT', 'OUTDATED']),
  fileName: z.string().regex(/^[A-Za-z0-9._-]+\.pdf$/),
  fileSizeBytes: z.number().int().min(1),
  downloadUrl: z.string().regex(/^\/admin\/students\/[0-9a-fA-F-]{36}\/latest-cv\/download$/),
}

export const adminLatestCvSchema: z.ZodType<ApiAdminLatestCvResponse> = z.discriminatedUnion(
  'availability',
  [
    z.object({ availability: z.literal('AVAILABLE'), ...latestCvFields }).strict(),
    z
      .object({
        availability: z.literal('NOT_SAVED'),
        cvId: z.null(),
        revision: z.null(),
        generatedAt: z.null(),
        savedAt: z.null(),
        freshnessStatus: z.null(),
        fileName: z.null(),
        fileSizeBytes: z.null(),
        downloadUrl: z.null(),
      })
      .strict(),
  ],
)

export const adminStudentDetailSchema: z.ZodType<ApiAdminStudentDetailResponse> = z
  .object({
    student: registeredStudentSchema,
    profile: adminStudentProfileSchema,
    cvSupportingData: adminStudentCvSupportingDataSchema,
    latestCv: adminLatestCvSchema,
  })
  .strict()

const academicRecordSourceSchema = z
  .object({ sourceUploadId: uuidSchema, committedAt: dateTimeSchema })
  .strict()

export const gpaAvailabilityStatusSchema = z.enum(['AVAILABLE', 'NOT_AVAILABLE'])

export const gpaSummarySchema: z.ZodType<ApiGpaSummaryResponse> = z.discriminatedUnion('status', [
  z
    .object({
      studentId: uuidSchema,
      status: z.literal('AVAILABLE'),
      computerScienceGpa: officialGpaSchema,
      totalCredits: z.number().min(0).multipleOf(0.1),
      calculatedAt: dateTimeSchema,
      source: academicRecordSourceSchema,
    })
    .strict(),
  z
    .object({
      studentId: uuidSchema,
      status: z.literal('NOT_AVAILABLE'),
      computerScienceGpa: z.null(),
      totalCredits: z.null(),
      calculatedAt: z.null(),
      source: z.null(),
    })
    .strict(),
])

export const adminDeclaredSkillSchema: z.ZodType<ApiDeclaredSkillResponse> = z
  .object({
    declaredSkillId: uuidSchema,
    skillId: uuidSchema,
    skillName: z.string().min(1),
    competencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    version: z.number().int().nonnegative(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict()

export const adminStudentProjectSchema: z.ZodType<ApiProjectResponse> = z
  .object({
    projectId: uuidSchema,
    title: z.string().min(1).max(200),
    description: z.string().nullable(),
    repositoryUrl: safeWebUrlSchema.nullable(),
    demoUrl: safeWebUrlSchema.nullable(),
    startDate: isoDateSchema.nullable(),
    endDate: isoDateSchema.nullable(),
    skills: z.array(
      z
        .object({
          skillId: uuidSchema,
          name: z.string().min(1),
          description: z.string().nullable().optional(),
        })
        .strict(),
    ),
    includeInCv: z.boolean(),
    version: z.number().int().nonnegative(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict()
  .superRefine(validateDateRange)

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

export const pagedAdminDeclaredSkillsSchema: z.ZodType<ApiPagedResponse<ApiDeclaredSkillResponse>> =
  createPagedResponseSchema(adminDeclaredSkillSchema)

export const pagedAdminStudentProjectsSchema: z.ZodType<ApiPagedResponse<ApiProjectResponse>> =
  createPagedResponseSchema(adminStudentProjectSchema)
