import { z } from 'zod'

export type FileSchemaOptions = {
  extensions: readonly string[]
  maxBytes: number
  allowedMimeTypes: readonly string[]
  allowEmptyMimeType?: boolean
}

export function createFileSchema({
  allowedMimeTypes,
  allowEmptyMimeType = false,
  extensions,
  maxBytes,
}: FileSchemaOptions) {
  return z.instanceof(File).superRefine((file, context) => {
    const lowerName = file.name.toLowerCase()
    if (!extensions.some((extension) => lowerName.endsWith(extension.toLowerCase()))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Choose a ${extensions.join(' or ')} file.`,
      })
    }
    if (file.size <= 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'The selected file is empty.' })
    }
    if (file.size > maxBytes) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The selected file must not exceed ${Math.floor(maxBytes / 1_048_576)} MiB.`,
      })
    }
    const normalizedType = file.type.toLowerCase()
    if (
      (!normalizedType && !allowEmptyMimeType) ||
      (normalizedType && !allowedMimeTypes.includes(normalizedType))
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The selected file type is not supported.',
      })
    }
  })
}
