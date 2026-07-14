import { z } from 'zod'

const safeWebUrl = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  }, 'Profile photo URL must use HTTP or HTTPS.')

export const studentProfileResponseSchema = z.object({
  studentId: z.string().uuid().optional(),
  fullName: z.string().optional(),
  indexNumber: z.string().optional(),
  universityEmail: z.string().email().optional(),
  summary: z.string().optional(),
  phone: z.string().optional(),
  profilePhotoUrl: safeWebUrl.optional(),
})

export const studentProfileFormSchema = z.object({
  fullName: z.string().transform((value) => value.trim()),
  summary: z.string().transform((value) => value.trim()),
  phone: z.string().transform((value) => value.trim()),
})
