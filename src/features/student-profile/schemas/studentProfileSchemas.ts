import { z } from 'zod'

export const safeWebUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  }, 'URL must use HTTP or HTTPS.')

export const fileAssetSchema = z
  .object({
    fileId: z.string().uuid(),
    fileName: z.string().max(255),
    mimeType: z.string().max(120),
    fileSizeBytes: z.number().int().positive(),
    url: safeWebUrlSchema,
    createdAt: z.string().datetime({ offset: true }),
  })
  .strict()

export const fileUploadConstraintSchema = z
  .object({
    allowedMimeTypes: z.array(z.string().min(1)).min(1),
    allowedExtensions: z.array(z.string().regex(/^\.[A-Za-z0-9]+$/)).min(1),
    maxSizeBytes: z.number().int().positive(),
  })
  .strict()

export const profileUploadPolicySchema = z
  .object({
    profilePhoto: fileUploadConstraintSchema,
    certificateEvidence: fileUploadConstraintSchema,
  })
  .strict()

export const studentProfileResponseSchema = z
  .object({
    studentId: z.string().uuid(),
    fullName: z.string().min(1).max(150),
    indexNumber: z.string().min(1).max(30),
    universityEmail: z.string().email().max(254),
    degreeProgramme: z.string(),
    studentLevel: z.union([z.literal(3), z.literal(4)]),
    cohortYear: z.number().int().nullable(),
    personalEmail: z.string().email().max(254).nullable(),
    headline: z.string().max(200).nullable(),
    summary: z.string().nullable(),
    phone: z.string().max(30).nullable(),
    location: z.string().max(150).nullable(),
    profilePhoto: fileAssetSchema.nullable(),
    version: z.number().int().nonnegative(),
    updatedAt: z.string().datetime({ offset: true }),
    cvSourceUpdatedAt: z.string().datetime({ offset: true }),
  })
  .strict()

const optionalEmail = z
  .string()
  .trim()
  .max(254, 'Personal Email must be 254 characters or fewer.')
  .refine((value) => value === '' || z.string().email().safeParse(value).success, {
    message: 'Enter a valid Personal Email.',
  })

export const studentProfileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full Name is required.')
    .max(150, 'Full Name must be 150 characters or fewer.'),
  personalEmail: optionalEmail,
  headline: z.string().trim().max(200, 'Professional Headline must be 200 characters or fewer.'),
  summary: z.string().trim(),
  phone: z.string().trim().max(30, 'Phone must be 30 characters or fewer.'),
  location: z.string().trim().max(150, 'Location must be 150 characters or fewer.'),
})
