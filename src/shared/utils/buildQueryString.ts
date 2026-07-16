export type QueryValue = string | number | boolean | null | undefined
export type QueryParameters = Record<string, QueryValue | QueryValue[]>

export function buildQueryString(parameters: QueryParameters): string {
  const searchParameters = new URLSearchParams()

  for (const [key, rawValue] of Object.entries(parameters)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue]
    for (const value of values) {
      if (value === null || value === undefined || value === '') {
        continue
      }
      searchParameters.append(key, String(value))
    }
  }

  const query = searchParameters.toString()
  return query ? `?${query}` : ''
}
