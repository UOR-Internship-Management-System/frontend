import { z } from 'zod'

export const studentDashboardMetricsSchema = z
  .object({
    projectCount: z.number().int().nonnegative(),
    shortlistedInternshipCount: z.number().int().nonnegative(),
    declaredSkillCount: z.number().int().nonnegative(),
    officialCumulativeGpa: z.number().min(0).max(4).multipleOf(0.01).nullable(),
    lastUpdatedAt: z.string().datetime({ offset: true }),
  })
  .strict()
