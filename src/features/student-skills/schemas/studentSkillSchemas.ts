import { z } from 'zod'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'
import { competencyLevels } from '../types/studentSkillTypes'

export const competencyLevelSchema = z.enum(competencyLevels)

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

export const declaredSkillSchema = z
  .object({
    declaredSkillId: z.string().uuid(),
    skillId: z.string().uuid(),
    skillName: z.string().min(1),
    competencyLevel: competencyLevelSchema,
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const pagedDeclaredSkillsSchema = createPagedResponseSchema(declaredSkillSchema)

export const declaredSkillCreateSchema = z
  .object({
    skillId: z.string().uuid('Select a valid taxonomy skill.'),
    competencyLevel: competencyLevelSchema,
  })
  .strict()

export const declaredSkillUpdateSchema = z
  .object({ competencyLevel: competencyLevelSchema })
  .strict()
