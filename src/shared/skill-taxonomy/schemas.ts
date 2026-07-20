import { z } from 'zod'
import { createPagedResponseSchema } from '../validation/paginationSchemas'

export const individualSkillSchema = z
  .object({
    skillId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
  })
  .strict()

export const skillCategorySchema = z
  .object({
    categoryId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    skills: z.array(individualSkillSchema).optional(),
  })
  .strict()

export const skillClusterSchema = z
  .object({
    clusterId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    categories: z.array(skillCategorySchema).optional(),
  })
  .strict()

export const skillTaxonomySchema = z.object({ clusters: z.array(skillClusterSchema) }).strict()

export const pagedSkillClustersSchema = createPagedResponseSchema(skillClusterSchema)
export const pagedSkillCategoriesSchema = createPagedResponseSchema(skillCategorySchema)
export const pagedIndividualSkillsSchema = createPagedResponseSchema(individualSkillSchema)
