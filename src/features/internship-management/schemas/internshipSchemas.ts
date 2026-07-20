import { z } from 'zod'
import type {
  ApiCompanyRequest,
  ApiCompanyResponse,
  ApiCompanyUpdateRequest,
  ApiPagedCompanyResponse,
} from '../../../shared/api/generated/cvManagementApi.types'
import { createPagedResponseSchema } from '../../../shared/validation/paginationSchemas'

const safeWebsiteSchema = z
  .string()
  .url()
  .max(500)
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'Website URL must use HTTP or HTTPS.',
  })

const companyFields = {
  name: z.string().min(1).max(200),
  websiteUrl: safeWebsiteSchema.nullable().optional(),
  contactPerson: z.string().max(150).nullable().optional(),
  contactEmail: z.string().email().max(254).nullable().optional(),
  contactPhone: z.string().max(30).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
}

export const companySortSchema = z.enum(['name,asc', 'name,desc', 'updatedAt,desc'])

export const companyRequestSchema: z.ZodType<ApiCompanyRequest> = z.object(companyFields).strict()

export const companyUpdateRequestSchema: z.ZodType<ApiCompanyUpdateRequest> = z
  .object({
    name: companyFields.name.optional(),
    websiteUrl: companyFields.websiteUrl,
    contactPerson: companyFields.contactPerson,
    contactEmail: companyFields.contactEmail,
    contactPhone: companyFields.contactPhone,
    notes: companyFields.notes,
    active: z.boolean().optional(),
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
    active: z.boolean(),
    version: z.number().int().nonnegative(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const pagedCompanyResponseSchema: z.ZodType<ApiPagedCompanyResponse> =
  createPagedResponseSchema(companyResponseSchema)
