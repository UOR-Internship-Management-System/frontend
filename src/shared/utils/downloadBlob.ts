export const defaultPdfFilename = 'student-cv.pdf'
export const defaultCsvFilename = 'shortlist.csv'
export const defaultZipFilename = 'shortlist-cvs.zip'

export type DownloadFileExtension = '.pdf' | '.csv' | '.zip'

export type DownloadFilenameOptions = {
  extension?: DownloadFileExtension
  fallback?: string
}

const maxFilenameLength = 128

export function sanitizeDownloadFilename(
  candidate: string | null | undefined,
  fallback = defaultPdfFilename,
  extension: DownloadFileExtension = '.pdf',
) {
  const safeFallback = ensureExtension(sanitizeFilenameCharacters(fallback), extension)
  const normalized = sanitizeFilenameCharacters(candidate ?? '')

  if (!normalized) return safeFallback

  const baseName = normalized.toLowerCase().endsWith(extension)
    ? normalized.slice(0, -extension.length)
    : normalized
  const safeBase = baseName
    .slice(0, maxFilenameLength - extension.length)
    .trim()
    .replace(/^[. -]+|[. -]+$/g, '')

  return safeBase ? `${safeBase}${extension}` : safeFallback
}

export function filenameFromContentDisposition(
  value: string | null,
  options: DownloadFilenameOptions = {},
) {
  const extension = options.extension ?? '.pdf'
  const fallback = options.fallback ?? defaultPdfFilename
  if (!value) return sanitizeDownloadFilename(null, fallback, extension)

  const encoded = value.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]?.trim()
  if (encoded) {
    try {
      return sanitizeDownloadFilename(decodeURIComponent(stripQuotes(encoded)), fallback, extension)
    } catch {
      // Continue to the ordinary filename parameter or controlled fallback.
    }
  }

  const quoted = value.match(/filename\s*=\s*"((?:\\.|[^"\\])*)"/i)?.[1]
  if (quoted) {
    return sanitizeDownloadFilename(quoted.replace(/\\(["\\])/g, '$1'), fallback, extension)
  }

  const unquoted = value.match(/filename\s*=\s*([^;]+)/i)?.[1]?.trim()
  return sanitizeDownloadFilename(unquoted ? stripQuotes(unquoted) : null, fallback, extension)
}

export function saveBlobAsFile(
  blob: Blob,
  filename: string,
  extension: DownloadFileExtension = '.pdf',
) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  try {
    anchor.href = objectUrl
    anchor.download = sanitizeDownloadFilename(filename, defaultFilename(extension), extension)
    anchor.hidden = true
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  }
}

function sanitizeFilenameCharacters(value: string) {
  return removeControlCharacters(value.normalize('NFKC'))
    .replace(/[/\\]/g, '-')
    .replace(/[<>:"|?*]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^[. -]+|[. -]+$/g, '')
}

function ensureExtension(value: string, extension: DownloadFileExtension) {
  if (!value) return defaultFilename(extension)
  return value.toLowerCase().endsWith(extension) ? value : `${value}${extension}`
}

function defaultFilename(extension: DownloadFileExtension) {
  switch (extension) {
    case '.csv':
      return defaultCsvFilename
    case '.zip':
      return defaultZipFilename
    default:
      return defaultPdfFilename
  }
}

function stripQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, '')
}

function removeControlCharacters(value: string) {
  return [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0
      return codePoint >= 32 && codePoint !== 127
    })
    .join('')
}
