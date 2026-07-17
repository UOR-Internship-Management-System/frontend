import { apiConfig } from './apiConfig'
import { authTokenStorage } from './authTokenStorage'
import { sessionEvents } from '../auth/sessionEvents'
import { filenameFromContentDisposition } from '../utils/downloadBlob'

export type DownloadedFile = {
  blob: Blob
  filename: string
  contentType: 'application/pdf'
  contentLength: number | null
}

export type DownloadRequestOptions = {
  signal?: AbortSignal
}

export async function httpDownloadClient(
  path: string,
  options: DownloadRequestOptions = {},
): Promise<DownloadedFile> {
  const token = authTokenStorage.getToken()
  const headers = new Headers()
  headers.set('Accept', 'application/pdf')
  headers.set(apiConfig.requestIdHeader, crypto.randomUUID?.() ?? `${Date.now()}`)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: 'GET',
    headers,
    signal: options.signal,
  })

  if (!response.ok) {
    if (response.status === 401 && token) {
      sessionEvents.notifyExpired()
    }
    throw await safeReadError(response)
  }

  const contentType = response.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase()
  if (contentType !== 'application/pdf') {
    throw invalidPdfProblem(response, 'The download response was not a PDF.')
  }

  const blob = await response.blob()
  if (blob.size < 1) {
    throw invalidPdfProblem(response, 'The downloaded PDF was empty.')
  }

  return {
    blob,
    filename: filenameFromContentDisposition(response.headers.get('Content-Disposition')),
    contentType: 'application/pdf',
    contentLength: readContentLength(response.headers.get('Content-Length')),
  }
}

function readContentLength(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : null
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

function invalidPdfProblem(response: Response, message: string) {
  return {
    type: 'about:blank',
    title: 'Invalid PDF response',
    status: response.status,
    code: 'INVALID_PDF_RESPONSE',
    message,
    correlationId: response.headers.get(apiConfig.requestIdHeader) ?? 'unavailable',
  }
}

function fallbackProblem(response: Response) {
  return {
    type: 'about:blank',
    title: 'Download failed',
    status: response.status,
    code: `HTTP_${response.status}`,
    message: 'The PDF could not be downloaded.',
    correlationId: response.headers.get(apiConfig.requestIdHeader) ?? 'unavailable',
  }
}
