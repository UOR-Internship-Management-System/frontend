import { z } from 'zod'

const requiredText = 'This field is required.'
const emailMessage = 'Enter a valid email address.'
const passwordPolicy =
  'Use at least 8 characters with uppercase, lowercase, number, and special character.'

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, requiredText).email(emailMessage).max(160),
  password: z.string().min(1, requiredText),
})

export const adminForgotPasswordSchema = z.object({
  email: z.string().trim().min(1, requiredText).email(emailMessage).max(160),
})

export const adminResetOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the six-digit OTP.'),
})

export const adminCreatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, passwordPolicy)
      .regex(/[A-Z]/, passwordPolicy)
      .regex(/[a-z]/, passwordPolicy)
      .regex(/[0-9]/, passwordPolicy)
      .regex(/[^A-Za-z0-9]/, passwordPolicy),
    confirmPassword: z.string().min(1, requiredText),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>
export type AdminForgotPasswordFormValues = z.infer<typeof adminForgotPasswordSchema>
export type AdminCreatePasswordFormValues = z.infer<typeof adminCreatePasswordSchema>

export function flattenAdminZodErrors(error: z.ZodError) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
  ) as Record<string, string | undefined>
}
