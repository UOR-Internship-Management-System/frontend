import { z } from 'zod'

const timestampSchema = z.string().datetime({ offset: true })

export const eligibleStudentSchema = z
  .object({
    id: z.string().uuid(),
    indexNumber: z.string().min(1).max(32),
    universityEmail: z.string().email().max(254),
    fullName: z.string().min(1).max(160),
    academicLevel: z.union([z.literal(3), z.literal(4)]),
    active: z.boolean(),
    registered: z.boolean(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .strict()

export const pageMetadataSchema = z
  .object({
    page: z.number().int().nonnegative(),
    size: z.number().int().min(1).max(500),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    sort: z.string(),
  })
  .strict()

export const eligibleStudentPagedResponseSchema = z
  .object({ items: z.array(eligibleStudentSchema), page: pageMetadataSchema })
  .strict()

export const eligibleStudentImportResultSchema = z
  .object({
    totalRows: z.number().int().nonnegative(),
    importedCount: z.number().int().nonnegative(),
    skippedCount: z.number().int().nonnegative(),
    errors: z.array(z.object({ row: z.number().int(), message: z.string() })),
  })
  .strict()

const indexNumberPattern = /^[A-Za-z]{2}\/[0-9]{4}\/[0-9]{5}$/

export const eligibleStudentFormSchema = z.object({
  indexNumber: z
    .string()
    .trim()
    .regex(indexNumberPattern, 'Use the format CS/2022/00123.'),
  universityEmail: z.string().trim().email('Enter a valid email address.').max(254),
  fullName: z.string().trim().min(1, 'Full name is required.').max(160),
  academicLevel: z.union([z.literal('3'), z.literal('4')], {
    errorMap: () => ({ message: 'Select academic level 3 or 4.' }),
  }),
})
