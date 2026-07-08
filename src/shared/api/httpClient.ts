import { apiConfig } from './apiConfig'
import { authTokenStorage } from './authTokenStorage'

export type HttpRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  headers?: HeadersInit
}

export async function httpClient<TResponse>(path: string, options: HttpRequestOptions = {}) {
  const token = authTokenStorage.getToken()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set(apiConfig.requestIdHeader, crypto.randomUUID?.() ?? `${Date.now()}`)

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
    signal: options.signal,
  })

  if (!response.ok) {
    throw await safeReadError(response)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

async function safeReadError(response: Response) {
  try {
    return await response.json()
  } catch {
    return { title: 'Request failed', status: response.status }
  }
}
