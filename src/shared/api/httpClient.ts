import { apiConfig } from './apiConfig'
import { authTokenStorage } from './authTokenStorage'
import { sessionEvents } from '../auth/sessionEvents'

export type HttpRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  headers?: HeadersInit
}

export type HttpResponseResult<TResponse> = {
  data: TResponse
  status: number
  headers: Headers
}

function isFormData(value: unknown): value is FormData {
  return (
    typeof FormData !== 'undefined' &&
    (value instanceof FormData || Object.prototype.toString.call(value) === '[object FormData]')
  )
}

export async function httpClient<TResponse>(path: string, options: HttpRequestOptions = {}) {
  const result = await httpClientWithResponse<TResponse>(path, options)
  return result.data
}

export async function httpClientWithResponse<TResponse>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<HttpResponseResult<TResponse>> {
  const token = authTokenStorage.getToken()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set(apiConfig.requestIdHeader, crypto.randomUUID?.() ?? `${Date.now()}`)

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    if (isFormData(options.body)) {
      headers.delete('Content-Type')
      body = options.body
    } else {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(options.body)
    }
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
    if (response.status === 401 && token) {
      sessionEvents.notifyExpired()
    }
    throw await safeReadError(response)
  }

  if (response.status === 204) {
    return { data: undefined as TResponse, status: response.status, headers: response.headers }
  }

  return {
    data: (await response.json()) as TResponse,
    status: response.status,
    headers: response.headers,
  }
}

async function safeReadError(response: Response) {
  const contentType = response.headers.get('Content-Type') ?? ''
  if (!contentType.toLowerCase().includes('json')) {
    return fallbackProblem(response)
  }

  try {
    return await response.json()
  } catch {
    return fallbackProblem(response)
  }
}

function fallbackProblem(response: Response) {
  return {
    type: 'about:blank',
    title: 'Request failed',
    status: response.status,
    code: `HTTP_${response.status}`,
    message: 'The request could not be completed.',
    correlationId: response.headers.get(apiConfig.requestIdHeader) ?? 'unavailable',
  }
}
