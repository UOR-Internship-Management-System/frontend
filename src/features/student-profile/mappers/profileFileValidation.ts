import type { FileUploadConstraint } from '../types/profileFileTypes'

export function fileAcceptValue(policy: FileUploadConstraint) {
  return [...new Set([...policy.allowedMimeTypes, ...policy.allowedExtensions])].join(',')
}

export function validateProfileFile(file: File, policy: FileUploadConstraint): string | null {
  const extension = file.name.includes('.') ? `.${file.name.split('.').at(-1)?.toLowerCase()}` : ''
  const extensions = policy.allowedExtensions.map((item) => item.toLowerCase())
  const mimeTypes = policy.allowedMimeTypes.map((item) => item.toLowerCase())
  if (
    !extension ||
    !extensions.includes(extension) ||
    !mimeTypes.includes(file.type.toLowerCase())
  ) {
    return `Choose a file with an allowed type: ${policy.allowedExtensions.join(', ')}.`
  }
  if (file.size > policy.maxSizeBytes) {
    return `Choose a file smaller than ${formatFileSize(policy.maxSizeBytes)}.`
  }
  return null
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
