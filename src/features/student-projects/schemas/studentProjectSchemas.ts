import { z } from 'zod'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'
import { individualSkillSchema } from '../../../shared/skill-taxonomy'

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

function isIsoDate(value: string) {
  if (!isoDatePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

const nullableDateSchema = z.string().refine(isIsoDate, 'Use a valid date.').nullable()
const normalizedSkillListSchema = z.array(individualSkillSchema).superRefine((skills, context) => {
  if (new Set(skills.map((skill) => skill.skillId)).size !== skills.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Project skills must have unique canonical identities.',
    })
  }
})
const safeWebUrlSchema = z
  .string()
  .url('Enter a valid web address.')
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'Use an http or https web address.',
  })

function validateDateRange(
  values: { startDate?: string | null; endDate?: string | null },
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

const projectResponseFields = {
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  repositoryUrl: safeWebUrlSchema.nullable(),
  demoUrl: safeWebUrlSchema.nullable(),
  startDate: nullableDateSchema,
  endDate: nullableDateSchema,
  skills: normalizedSkillListSchema,
  includeInCv: z.boolean(),
  version: z.number().int().nonnegative(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
}

export const studentProjectSchema = z
  .object(projectResponseFields)
  .strict()
  .superRefine(validateDateRange)

export const pagedStudentProjectsSchema = createPagedResponseSchema(studentProjectSchema)

const projectRequestFields = {
  title: z.string().trim().min(1, 'Enter a project title.').max(200),
  description: z.string().nullable(),
  repositoryUrl: safeWebUrlSchema.nullable(),
  demoUrl: safeWebUrlSchema.nullable(),
  startDate: nullableDateSchema,
  endDate: nullableDateSchema,
  skillIds: z
    .array(z.string().uuid('Select a valid taxonomy skill.'))
    .superRefine((values, ctx) => {
      if (new Set(values).size !== values.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select each skill only once.' })
      }
    }),
  includeInCv: z.boolean(),
}

export const studentProjectCreateSchema = z
  .object(projectRequestFields)
  .strict()
  .superRefine(validateDateRange)

export const studentProjectUpdateSchema = z
  .object({
    title: projectRequestFields.title.optional(),
    description: projectRequestFields.description.optional(),
    repositoryUrl: projectRequestFields.repositoryUrl.optional(),
    demoUrl: projectRequestFields.demoUrl.optional(),
    startDate: projectRequestFields.startDate.optional(),
    endDate: projectRequestFields.endDate.optional(),
    skillIds: projectRequestFields.skillIds.optional(),
    includeInCv: projectRequestFields.includeInCv.optional(),
  })
  .strict()
  .refine((values) => Object.keys(values).length > 0, 'Change at least one project field.')
  .superRefine(validateDateRange)

export const studentProjectFormSchema = z
  .object({
    title: projectRequestFields.title,
    description: z.string(),
    repositoryUrl: z.union([z.literal(''), safeWebUrlSchema]),
    demoUrl: z.union([z.literal(''), safeWebUrlSchema]),
    startDate: z.union([z.literal(''), z.string().refine(isIsoDate, 'Use a valid date.')]),
    endDate: z.union([z.literal(''), z.string().refine(isIsoDate, 'Use a valid date.')]),
    skillIds: projectRequestFields.skillIds,
    includeInCv: z.boolean(),
  })
  .strict()
  .superRefine(validateDateRange)
