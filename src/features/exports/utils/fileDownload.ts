export function candidateCvFallbackFilename(indexNumber: string) {
  const normalized = indexNumber.trim().replace(/[^A-Za-z0-9_-]+/g, '-')
  return `${normalized || 'student'}-latest-cv.pdf`
}
