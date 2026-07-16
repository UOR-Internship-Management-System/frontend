import { z } from 'zod'

export const pageMetadataSchema = z
  .object({
    page: z.number().int().nonnegative(),
    size: z.number().int().min(1).max(100),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    sort: z.string(),
  })
  .strict()

export function createPagedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z
    .object({
      items: z.array(itemSchema),
      page: pageMetadataSchema,
    })
    .strict()
}
