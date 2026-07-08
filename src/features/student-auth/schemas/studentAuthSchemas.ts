import { z } from 'zod'

const requiredText = 'This field is required.'
const emailMessage = 'Enter a valid email address.'
const passwordPolicy =
  'Use at least 8 characters with uppercase, lowercase, number, and special character.'

export const studentSignUpSchema = z.object({
  fullName: z.string().trim().min(1, requiredText).max(120, 'Full name is too long.'),
  indexNumber: z.string().trim().min(1, requiredText).max(40, 'Index number is too long.'),
  universityEmail: z.string().trim().min(1, requiredText).email(emailMessage).max(160),
})

export const loginSchema = z.object({
  email: z.string().trim().min(1, requiredText).email(emailMessage).max(160),
  password: z.string().min(1, requiredText),
})

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the six-digit OTP.'),
})

export const passwordSchema = z
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

export const passwordResetStartSchema = z.object({
  email: z.string().trim().min(1, requiredText).email(emailMessage).max(160),
})

export type StudentSignUpFormValues = z.infer<typeof studentSignUpSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type OtpFormValues = z.infer<typeof otpSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>
export type PasswordResetStartFormValues = z.infer<typeof passwordResetStartSchema>

export function flattenZodErrors(error: z.ZodError) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
  ) as Record<string, string | undefined>
}
