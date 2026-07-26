import { apiConfig } from './apiConfig'
import { authTokenStorage } from './authTokenStorage'
import { sessionEvents } from '../auth/sessionEvents'
import {
  defaultCsvFilename,
  defaultPdfFilename,
  defaultZipFilename,
  filenameFromContentDisposition,
} from '../utils/downloadBlob'
import type { DownloadFileExtension } from '../utils/downloadBlob'

export const downloadContentTypes = ['application/pdf', 'text/csv', 'application/zip'] as const
export type DownloadContentType = (typeof downloadContentTypes)[number]

export type DownloadedFile<TContentType extends DownloadContentType = 'application/pdf'> = {
  blob: Blob
  filename: string
  contentType: TContentType
  contentLength: number | null
}

export type DownloadRequestOptions<TContentType extends DownloadContentType = 'application/pdf'> = {
  signal?: AbortSignal
  expectedContentType?: TContentType
  fallbackFilename?: string
}

type DownloadFormat = {
  extension: DownloadFileExtension
  fallbackFilename: string
  label: string
}

const downloadFormats: Record<DownloadContentType, DownloadFormat> = {
  'application/pdf': { extension: '.pdf', fallbackFilename: defaultPdfFilename, label: 'PDF' },
  'text/csv': { extension: '.csv', fallbackFilename: defaultCsvFilename, label: 'CSV' },
  'application/zip': { extension: '.zip', fallbackFilename: defaultZipFilename, label: 'ZIP' },
}

export async function httpDownloadClient<
  TContentType extends DownloadContentType = 'application/pdf',
>(
  path: string,
  options: DownloadRequestOptions<TContentType> = {},
): Promise<DownloadedFile<TContentType>> {
  const expectedContentType = (options.expectedContentType ?? 'application/pdf') as TContentType
  const format = downloadFormats[expectedContentType]
  const token = authTokenStorage.getToken()
  const headers = new Headers()
  headers.set('Accept', expectedContentType)
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
    throw await safeReadError(response, expectedContentType)
  }

  const contentType = response.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase()
  if (contentType !== expectedContentType) {
    throw invalidFileProblem(
      response,
      expectedContentType,
      `The download response was not a ${format.label}.`,
    )
  }

  const blob = await response.blob()
  if (blob.size < 1) {
    throw invalidFileProblem(
      response,
      expectedContentType,
      `The downloaded ${format.label} was empty.`,
    )
  }

  return {
    blob,
    filename: filenameFromContentDisposition(response.headers.get('Content-Disposition'), {
      extension: format.extension,
      fallback: options.fallbackFilename ?? format.fallbackFilename,
    }),
    contentType: expectedContentType,
    contentLength: readContentLength(response.headers.get('Content-Length')),
  }
}

function readContentLength(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : null
}

async function safeReadError(response: Response, contentType: DownloadContentType) {
  const responseContentType = response.headers.get('Content-Type') ?? ''
  if (!responseContentType.toLowerCase().includes('json')) {
    return fallbackProblem(response, contentType)
  }

  try {
    return normalizeProblemDetails(await response.json(), response, contentType)
  } catch {
    return fallbackProblem(response, contentType)
  }
}

function normalizeProblemDetails(
  value: unknown,
  response: Response,
  contentType: DownloadContentType,
) {
  if (
    !isRecord(value) ||
    value.status !== response.status ||
    typeof value.title !== 'string' ||
    typeof value.code !== 'string'
  ) {
    return fallbackProblem(response, contentType)
  }

  const format = downloadFormats[contentType]
  return {
    type: 'about:blank',
    title: `${format.label} download failed`,
    status: response.status,
    code: /^[A-Z0-9_]{1,100}$/.test(value.code) ? value.code : `HTTP_${response.status}`,
    message: `The ${format.label} could not be downloaded.`,
    correlationId:
      typeof value.correlationId === 'string' &&
      /^[A-Za-z0-9._:-]{1,128}$/.test(value.correlationId)
        ? value.correlationId
        : (response.headers.get(apiConfig.requestIdHeader) ?? 'unavailable'),
  }
}

function invalidFileProblem(response: Response, contentType: DownloadContentType, message: string) {
  const format = downloadFormats[contentType]
  return {
    type: 'about:blank',
    title: `Invalid ${format.label} response`,
    status: response.status,
    code: `INVALID_${format.label}_RESPONSE`,
    message,
    correlationId: response.headers.get(apiConfig.requestIdHeader) ?? 'unavailable',
  }
}

function fallbackProblem(response: Response, contentType: DownloadContentType) {
  const format = downloadFormats[contentType]
  return {
    type: 'about:blank',
    title: 'Download failed',
    status: response.status,
    code: `HTTP_${response.status}`,
    message: `The ${format.label} could not be downloaded.`,
    correlationId: response.headers.get(apiConfig.requestIdHeader) ?? 'unavailable',
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
