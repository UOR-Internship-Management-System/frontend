export function formatIfMatchVersion(version: number) {
  if (!Number.isSafeInteger(version) || version < 0) {
    throw new TypeError('Entity version must be a non-negative safe integer.')
  }

  return `"${version}"`
}
