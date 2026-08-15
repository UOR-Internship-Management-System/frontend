import { z } from 'zod'
import type {
  ApiCompanyRequest,
  ApiCompanyResponse,
  ApiCompanyUpdateRequest,
  ApiInternshipRequestCreateRequest,
  ApiInternshipRequestResponse,
  ApiInternshipRequestSummaryResponse,
  ApiInternshipRequestUpdateRequest,
  ApiInternshipRequiredSkillRequest,
  ApiInternshipRequiredSkillResponse,
  ApiPagedCompanyResponse,
  ApiPagedInternshipRequestResponse,
  ApiPagedInternshipRequiredSkillResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

const safeWebsiteSchema = z
  .string()
  .url()
  .max(500)
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'Website URL must use HTTP or HTTPS.',
  })

const nullableFormTextSchema = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || null)

const nullableFormWebsiteSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => !value || safeWebsiteSchema.safeParse(value).success,
    'Enter a valid HTTP or HTTPS website URL.',
  )
  .transform((value) => value || null)

const nullableFormEmailSchema = z
  .string()
  .trim()
  .max(254)
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: 'Enter a valid email address.',
  })
  .transform((value) => value || null)

const companyFields = {
  name: z.string().min(1).max(200),
  websiteUrl: safeWebsiteSchema.nullable().optional(),
  contactPerson: z.string().max(150).nullable().optional(),
  contactEmail: z.string().email().max(254).nullable().optional(),
  contactPhone: z.string().max(30).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
}

export const companySortSchema = z.enum(['name,asc', 'name,desc', 'updatedAt,desc'])

export const companyFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Company name is required.').max(200),
    websiteUrl: nullableFormWebsiteSchema.refine(Boolean, 'Corporate website is required.'),
    contactPerson: nullableFormTextSchema(150).refine(Boolean, 'HR representative is required.'),
    contactEmail: nullableFormEmailSchema.refine(Boolean, 'HR email address is required.'),
    contactPhone: nullableFormTextSchema(30).refine(Boolean, 'Direct line phone is required.'),
    notes: nullableFormTextSchema(4000),
  })
  .strict()

export const companyRequestSchema: z.ZodType<ApiCompanyRequest> = z.object(companyFields).strict()

export const companyUpdateRequestSchema: z.ZodType<ApiCompanyUpdateRequest> = z
  .object({
    name: companyFields.name.optional(),
    websiteUrl: companyFields.websiteUrl,
    contactPerson: companyFields.contactPerson,
    contactEmail: companyFields.contactEmail,
    contactPhone: companyFields.contactPhone,
    notes: companyFields.notes,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Change at least one company field.')

export const companyResponseSchema: z.ZodType<ApiCompanyResponse> = z
  .object({
    companyId: z.string().uuid(),
    name: z.string().min(1).max(200),
    websiteUrl: safeWebsiteSchema.nullable(),
    contactPerson: z.string().max(150).nullable(),
    contactEmail: z.string().email().max(254).nullable(),
    contactPhone: z.string().max(30).nullable(),
    notes: z.string().max(4000).nullable(),
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const pagedCompanyResponseSchema: z.ZodType<ApiPagedCompanyResponse> =
  createPagedResponseSchema(companyResponseSchema)

export const internshipRequestSortSchema = z.enum([
  'createdAt,desc',
  'title,asc',
  'companyName,asc',
])
export const internshipRequiredSkillRequestSchema: z.ZodType<ApiInternshipRequiredSkillRequest> = z
  .object({
    skillId: z.string().uuid(),
  })
  .strict()

export const internshipRequiredSkillResponseSchema: z.ZodType<ApiInternshipRequiredSkillResponse> =
  z
    .object({
      requiredSkillId: z.string().uuid(),
      skillId: z.string().uuid(),
      skillName: z.string().min(1),
    })
    .strict()

const requiredSkillsSchema = z
  .array(internshipRequiredSkillRequestSchema)
  .max(100)
  .refine(
    (skills) => new Set(skills.map((skill) => skill.skillId)).size === skills.length,
    'Select each required skill only once.',
  )

const internshipRequestFields = {
  companyId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).nullable().optional(),
  shortlistGuidanceValue: z.number().int().min(0).max(10000).nullable().optional(),
  requiredSkills: requiredSkillsSchema,
}

export const internshipRequestCreateSchema: z.ZodType<ApiInternshipRequestCreateRequest> = z
  .object(internshipRequestFields)
  .strict()

export const internshipRequestUpdateSchema: z.ZodType<ApiInternshipRequestUpdateRequest> = z
  .object({
    title: internshipRequestFields.title.optional(),
    description: internshipRequestFields.description,
    shortlistGuidanceValue: internshipRequestFields.shortlistGuidanceValue,
    requiredSkills: internshipRequestFields.requiredSkills.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Change at least one internship request field.')

export const internshipRequestResponseSchema: z.ZodType<ApiInternshipRequestResponse> = z
  .object({
    requestId: z.string().uuid(),
    company: companyResponseSchema,
    title: z.string().min(1).max(200),
    description: z.string().max(10000).nullable(),
    shortlistGuidanceValue: z.number().int().nonnegative().nullable(),
    requiredSkills: z.array(internshipRequiredSkillResponseSchema),
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const internshipRequestSummaryResponseSchema: z.ZodType<ApiInternshipRequestSummaryResponse> =
  z
    .object({
      requestId: z.string().uuid(),
      companyId: z.string().uuid(),
      companyName: z.string().min(1),
      title: z.string().min(1).max(200),
      shortlistGuidanceValue: z.number().int().nonnegative().nullable(),
    })
    .strict()

export const pagedInternshipRequestResponseSchema: z.ZodType<ApiPagedInternshipRequestResponse> =
  createPagedResponseSchema(internshipRequestResponseSchema)

export const pagedInternshipRequiredSkillResponseSchema: z.ZodType<ApiPagedInternshipRequiredSkillResponse> =
  createPagedResponseSchema(internshipRequiredSkillResponseSchema)

export const internshipRequestFormValuesSchema = z
  .object({
    companyId: z.string().uuid('Select an active company.'),
    title: z.string().trim().min(1, 'Role title is required.').max(200),
    description: z.string().trim().max(10000, 'Description cannot exceed 10000 characters.'),
    shortlistGuidanceValue: z
      .string()
      .trim()
      .refine((value) => !value || /^\d+$/.test(value), 'Enter a whole number from 0 to 10000.')
      .refine(
        (value) => !value || (Number(value) >= 0 && Number(value) <= 10000),
        'Enter a whole number from 0 to 10000.',
      ),
    requiredSkills: z
      .array(
        z
          .object({
            skillId: z.string().uuid(),
            skillName: z.string().min(1),
          })
          .strict(),
      )
      .max(100)
      .refine(
        (skills) => new Set(skills.map((skill) => skill.skillId)).size === skills.length,
        'Select each required skill only once.',
      ),
  })
  .strict()
