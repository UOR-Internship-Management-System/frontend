export function clampPage(page: number, totalElements: number, pageSize: number): number {
  if (!Number.isInteger(page) || page < 0) {
    return 0
  }

  if (!Number.isFinite(totalElements) || totalElements <= 0) {
    return 0
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    return 0
  }

  const lastPage = Math.max(0, Math.ceil(totalElements / pageSize) - 1)
  return Math.min(page, lastPage)
}
