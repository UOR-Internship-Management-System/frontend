import { z } from 'zod'
import { fileAssetSchema, safeWebUrlSchema } from './studentProfileSchemas'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
const nullableDateSchema = dateSchema.nullable()
const timestampSchema = z.string().datetime({ offset: true })
const baseResponse = {
  id: z.string().uuid(),
  cvInclude: z.boolean(),
  version: z.number().int().nonnegative(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
}

export const pageMetadataSchema = z
  .object({
    page: z.number().int().nonnegative(),
    size: z.number().int().min(1).max(100),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    sort: z.string(),
  })
  .strict()

export const contactLinkSchema = z
  .object({
    ...baseResponse,
    label: z.string().min(1).max(60),
    url: safeWebUrlSchema,
    displayOrder: z.number().int().nonnegative(),
  })
  .strict()
export const certificateSchema = z
  .object({
    ...baseResponse,
    title: z.string().min(1).max(200),
    issuer: z.string().min(1).max(200),
    issueDate: dateSchema,
    credentialUrl: safeWebUrlSchema.nullable(),
    evidence: fileAssetSchema.nullable(),
  })
  .strict()
export const awardSchema = z
  .object({
    ...baseResponse,
    title: z.string().min(1).max(200),
    issuer: z.string().min(1).max(200),
    awardDate: dateSchema,
    description: z.string().nullable(),
  })
  .strict()
export const activitySchema = z
  .object({
    ...baseResponse,
    activityName: z.string().min(1).max(200),
    roleTitle: z.string().min(1).max(150),
    startDate: nullableDateSchema,
    endDate: nullableDateSchema,
    description: z.string().nullable(),
  })
  .strict()
export const experienceSchema = z
  .object({
    ...baseResponse,
    organization: z.string().min(1).max(200),
    positionTitle: z.string().min(1).max(150),
    location: z.string().nullable(),
    startDate: dateSchema,
    endDate: nullableDateSchema,
    currentRole: z.boolean(),
    description: z.string().nullable(),
  })
  .strict()

export const pagedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({ items: z.array(itemSchema), page: pageMetadataSchema }).strict()

const optionalSafeUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || safeWebUrlSchema.safeParse(value).success,
    'Enter a valid HTTP or HTTPS URL.',
  )
const nullableText = z.string().trim()

export const contactLinkFormSchema = z.object({
  label: z.string().trim().min(1, 'Label is required.').max(60),
  url: safeWebUrlSchema,
  displayOrder: z.string().regex(/^\d+$/, 'Display Order must be zero or greater.'),
  cvInclude: z.boolean(),
})
export const certificateFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  issuer: z.string().trim().min(1, 'Issuer is required.').max(200),
  issueDate: dateSchema,
  credentialUrl: optionalSafeUrl,
  cvInclude: z.boolean(),
})
export const awardFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  issuer: z.string().trim().min(1, 'Issuer is required.').max(200),
  awardDate: dateSchema,
  description: nullableText,
  cvInclude: z.boolean(),
})
export const activityFormSchema = z
  .object({
    activityName: z.string().trim().min(1, 'Activity Name is required.').max(200),
    roleTitle: z.string().trim().min(1, 'Role is required.').max(150),
    startDate: z.union([z.literal(''), dateSchema]),
    endDate: z.union([z.literal(''), dateSchema]),
    description: nullableText,
    cvInclude: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End Date cannot be before Start Date.',
      })
  })
export const experienceFormSchema = z
  .object({
    organization: z.string().trim().min(1, 'Organization is required.').max(200),
    positionTitle: z.string().trim().min(1, 'Position Title is required.').max(150),
    location: nullableText,
    startDate: dateSchema,
    endDate: z.union([z.literal(''), dateSchema]),
    currentRole: z.boolean(),
    description: nullableText,
    cvInclude: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.currentRole && value.endDate)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'Current roles cannot have an End Date.',
      })
    if (!value.currentRole && !value.endDate)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End Date is required unless this is a current role.',
      })
    if (value.endDate && value.endDate < value.startDate)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End Date cannot be before Start Date.',
      })
  })
