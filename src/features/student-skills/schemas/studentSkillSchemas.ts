import { z } from 'zod'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'
import { competencyLevels } from '../types/studentSkillTypes'

export const competencyLevelSchema = z.enum(competencyLevels)

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
