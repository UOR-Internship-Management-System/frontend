export const defaultPdfFilename = 'student-cv.pdf'

const maxFilenameLength = 128

export function sanitizeDownloadFilename(
  candidate: string | null | undefined,
  fallback = defaultPdfFilename,
) {
  const normalized = removeControlCharacters((candidate ?? '').normalize('NFKC'))
    .replace(/[/\\]/g, '-')
    .replace(/[<>:"|?*]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^[. -]+|[. -]+$/g, '')

  if (!normalized) {
    return fallback
  }

  const baseName = normalized.toLowerCase().endsWith('.pdf') ? normalized.slice(0, -4) : normalized
  const safeBase = baseName
    .slice(0, maxFilenameLength - 4)
    .trim()
    .replace(/^[. -]+|[. -]+$/g, '')

  return safeBase ? `${safeBase}.pdf` : fallback
}

export function filenameFromContentDisposition(value: string | null) {
  if (!value) return defaultPdfFilename

  const encoded = value.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]?.trim()
  if (encoded) {
    try {
      return sanitizeDownloadFilename(decodeURIComponent(stripQuotes(encoded)))
    } catch {
      // Continue to the ordinary filename parameter or controlled fallback.
    }
  }

  const quoted = value.match(/filename\s*=\s*"((?:\\.|[^"\\])*)"/i)?.[1]
  if (quoted) {
    return sanitizeDownloadFilename(quoted.replace(/\\(["\\])/g, '$1'))
  }

  const unquoted = value.match(/filename\s*=\s*([^;]+)/i)?.[1]?.trim()
  return sanitizeDownloadFilename(unquoted ? stripQuotes(unquoted) : null)
}

export function saveBlobAsFile(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  try {
    anchor.href = objectUrl
    anchor.download = sanitizeDownloadFilename(filename)
    anchor.hidden = true
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
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
