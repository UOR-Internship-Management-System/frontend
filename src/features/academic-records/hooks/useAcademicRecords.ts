import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { academicRecordsApi } from '../api/academicRecordsApi'
import { mapAcademicRecord } from '../mappers/academicRecordMapper'
import type { AcademicRecordQuery } from '../types/academicRecordTypes'
import { academicRecordKeys } from './academicRecordKeys'

const nonRetryableStatuses = new Set([400, 401, 403, 404, 409, 415, 422, 429])

export function shouldRetryAcademicRecordsQuery(failureCount: number, error: unknown) {
  if (error instanceof ZodError) return false

  const mappedStatus = mapApiError(error, 'protected').status
  const rawStatus =
    typeof error === 'object' && error !== null && typeof Reflect.get(error, 'status') === 'number'
      ? (Reflect.get(error, 'status') as number)
      : undefined
  const status = mappedStatus ?? rawStatus
  if (status && (nonRetryableStatuses.has(status) || status < 500)) return false

  return failureCount < 1
}

export function useAcademicRecords(query: AcademicRecordQuery) {
  return useQuery({
    queryKey: academicRecordKeys.recordList(query),
    queryFn: ({ signal }) => academicRecordsApi.list(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryAcademicRecordsQuery,
    select: (response) => ({
      ...response,
      items: response.items.map(mapAcademicRecord),
    }),
  })
}
